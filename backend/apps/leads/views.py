from django.db import transaction, models
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.customers.models import Customer, CustomerContact
from apps.opportunities.models import Opportunity
from apps.tasks.models import Task

from .models import Lead, LeadNote
from .permissions import IsLeadOwnerOrManager
from .serializers import (
    LeadListSerializer,
    LeadDetailSerializer,
    LeadNoteSerializer,
    LeadConvertSerializer,
)


class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsLeadOwnerOrManager]
    filterset_fields = ['status', 'priority', 'source', 'assigned_to']
    search_fields = ['first_name', 'last_name', 'email', 'phone', 'company_name']
    ordering_fields = ['created_at', 'priority', 'estimated_budget', 'follow_up_date']

    def get_queryset(self):
        user = self.request.user
        queryset = Lead.objects.select_related('assigned_to', 'created_by')

        if not user.is_manager:
            return queryset.filter(models.Q(assigned_to=user) | models.Q(created_by=user))
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LeadDetailSerializer
        return LeadListSerializer

    def perform_create(self, serializer):
        assigned_user = serializer.validated_data.get('assigned_to') or self.request.user
        serializer.save(created_by=self.request.user, assigned_to=assigned_user)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(lead=lead, author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='convert')
    def convert(self, request, pk=None):
        lead = self.get_object()

        if lead.status == Lead.Status.CONVERTED:
            return Response(
                {"error": "This lead has already been converted into a customer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = LeadConvertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            customer_name = lead.company_name or f"{lead.first_name} {lead.last_name or ''}".strip()
            customer = Customer.objects.create(
                name=customer_name,
                customer_type=Customer.CustomerType.COMPANY if lead.company_name else Customer.CustomerType.INDIVIDUAL,
                email=lead.email,
                phone=lead.phone,
                account_manager=lead.assigned_to or request.user,
                status=Customer.Status.ACTIVE
            )

            CustomerContact.objects.create(
                customer=customer,
                first_name=lead.first_name,
                last_name=lead.last_name,
                designation=lead.designation,
                email=lead.email,
                phone=lead.phone,
                is_primary=True
            )

            deal_amount = data.get('deal_amount') or lead.estimated_budget or 0
            deal_title = data.get('deal_title') or f"Deal - {customer_name}"
            opportunity = Opportunity.objects.create(
                title=deal_title,
                customer=customer,
                lead=lead,
                amount=deal_amount,
                stage='discovery',
                probability=20,
                expected_close_date=data.get('expected_close_date'),
                assigned_to=lead.assigned_to or request.user
            )

            Task.objects.create(
                title=f"Onboard new customer: {customer_name}",
                description=f"Initial discovery call & proposal for opportunity: {opportunity.title}",
                priority='high',
                status='pending',
                assigned_to=lead.assigned_to or request.user,
                customer=customer,
                lead=lead
            )

            lead.status = Lead.Status.CONVERTED
            lead.converted_at = timezone.now()
            lead.save()

        return Response({
            "message": "Lead converted successfully!",
            "customer_id": customer.id,
            "customer_name": customer.name,
            "opportunity_id": opportunity.id,
            "opportunity_title": opportunity.title,
            "deal_amount": opportunity.amount,
        }, status=status.HTTP_201_CREATED)
