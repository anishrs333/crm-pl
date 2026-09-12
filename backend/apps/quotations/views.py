from django.db import transaction
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.opportunities.models import Opportunity
from .models import Quotation, QuotationItem
from .permissions import IsQuotationOwnerOrManager
from .serializers import (
    QuotationListSerializer,
    QuotationDetailSerializer,
    QuotationCreateUpdateSerializer,
)
from .pdf_generator import generate_quotation_pdf


class QuotationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsQuotationOwnerOrManager]
    filterset_fields = ['status', 'customer', 'created_by']
    search_fields = ['quote_number', 'customer__name', 'notes']
    ordering_fields = ['created_at', 'valid_until']

    def get_queryset(self):
        user = self.request.user
        queryset = Quotation.objects.select_related('customer', 'created_by').prefetch_related('items')

        if not user.is_manager:
            return queryset.filter(created_by=user)
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuotationDetailSerializer
        elif self.action in ('create', 'update', 'partial_update'):
            return QuotationCreateUpdateSerializer
        return QuotationListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'], url_path='pdf')
    def generate_pdf(self, request, pk=None):
        quotation = self.get_object()
        pdf_buffer = generate_quotation_pdf(quotation)
        filename = f"Quotation_{quotation.quote_number}.pdf"

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_quotation(self, request, pk=None):
        quotation = self.get_object()

        with transaction.atomic():
            quotation.status = Quotation.Status.ACCEPTED
            quotation.save()

            if quotation.opportunity:
                opportunity = quotation.opportunity
                opportunity.stage = Opportunity.Stage.WON
                opportunity.probability = 100
                opportunity.amount = quotation.grand_total
                opportunity.save()

        return Response({
            "message": "Quotation accepted and opportunity updated successfully.",
            "status": quotation.status,
            "grand_total": quotation.grand_total,
        }, status=status.HTTP_200_OK)


