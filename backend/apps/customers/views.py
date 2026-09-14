from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Customer, CustomerContact, CustomerInteraction
from .serializers import (
    CustomerListSerializer,
    CustomerDetailSerializer,
    CustomerContactSerializer,
    CustomerInteractionSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    filterset_fields = ['customer_type', 'status', 'account_manager', 'city']
    search_fields = ['name', 'email', 'phone', 'gst_number', 'city']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = Customer.objects.select_related('account_manager')

        if not user.is_manager:
            return queryset.filter(account_manager=user)
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerListSerializer

    def perform_create(self, serializer):
        # Auto-assign account manager to the creator if not explicitly provided
        if 'account_manager' not in serializer.validated_data or not serializer.validated_data['account_manager']:
            serializer.save(account_manager=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'], url_path='log-interaction')
    def log_interaction(self, request, pk=None):
        customer = self.get_object()
        serializer = CustomerInteractionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(customer=customer, logged_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomerContactViewSet(viewsets.ModelViewSet):
    queryset = CustomerContact.objects.select_related('customer')
    serializer_class = CustomerContactSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['customer', 'is_primary']
