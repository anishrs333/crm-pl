from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Opportunity
from .permissions import IsOpportunityOwnerOrManager
from .serializers import (
    OpportunityListSerializer,
    OpportunityDetailSerializer,
    OpportunityCreateUpdateSerializer,
    CloseOpportunitySerializer,
)


class OpportunityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOpportunityOwnerOrManager]
    filterset_fields = ['stage', 'customer', 'assigned_to']
    search_fields = ['title', 'customer__name', 'lost_reason']
    ordering_fields = ['amount', 'expected_close_date', 'created_at', 'probability']

    def get_queryset(self):
        user = self.request.user
        queryset = Opportunity.objects.select_related('customer', 'assigned_to', 'created_by')

        # Data Isolation: Sales Reps only see deals assigned to or created by them
        if not user.is_manager:
            return queryset.filter(Q(assigned_to=user) | Q(created_by=user))
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OpportunityDetailSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return OpportunityCreateUpdateSerializer
        return OpportunityListSerializer

    def perform_create(self, serializer):
        assigned_user = serializer.validated_data.get('assigned_to') or self.request.user
        serializer.save(created_by=self.request.user, assigned_to=assigned_user)

    @action(detail=False, methods=['get'], url_path='pipeline-summary')
    def pipeline_summary(self, request):
        """
        HIGH-PERFORMANCE KANBAN FEED:
        Returns aggregated deal counts, total stage values, and weighted revenue forecasts
        grouped by pipeline stage.
        """
        queryset = self.get_queryset()

        stage_metrics = []
        total_pipeline_value = Decimal('0.00')
        total_weighted_forecast = Decimal('0.00')

        for stage_code, stage_name in Opportunity.Stage.choices:
            stage_deals = queryset.filter(stage=stage_code)
            agg = stage_deals.aggregate(
                total_val=Sum('amount'),
                deal_count=Count('id')
            )

            total_val = agg['total_val'] or Decimal('0.00')
            deal_count = agg['deal_count'] or 0

            # Calculate weighted value for this stage
            prob = Opportunity.STAGE_PROBABILITY_MAP.get(stage_code, 0)
            weighted_val = (total_val * (Decimal(prob) / Decimal('100.00'))).quantize(Decimal('0.01'))

            total_pipeline_value += total_val
            total_weighted_forecast += weighted_val

            stage_metrics.append({
                "stage": stage_code,
                "stage_label": stage_name,
                "probability_percentage": prob,
                "deal_count": deal_count,
                "total_amount": total_val,
                "weighted_amount": weighted_val,
            })

        return Response({
            "total_deals": queryset.count(),
            "total_pipeline_value": total_pipeline_value,
            "total_weighted_forecast": total_weighted_forecast,
            "stages": stage_metrics,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='close')
    def close_deal(self, request, pk=None):
        """
        CLOSING ACTION: Mark an opportunity as Closed Won or Closed Lost.
        POST /api/opportunities/{id}/close/
        """
        opportunity = self.get_object()
        serializer = CloseOpportunitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        deal_status = serializer.validated_data['status']
        lost_reason = serializer.validated_data.get('lost_reason', '')

        if deal_status == 'won':
            opportunity.stage = Opportunity.Stage.WON
            opportunity.probability = 100
            opportunity.lost_reason = ''
        else:
            opportunity.stage = Opportunity.Stage.LOST
            opportunity.probability = 0
            opportunity.lost_reason = lost_reason

        opportunity.actual_close_date = timezone.now()
        opportunity.save()

        return Response({
            "message": f"Deal successfully marked as Closed {deal_status.upper()}.",
            "id": opportunity.id,
            "stage": opportunity.stage,
            "probability": opportunity.probability,
            "actual_close_date": opportunity.actual_close_date,
        }, status=status.HTTP_200_OK)