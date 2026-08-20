from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Quotation, QuotationItem
from .serializers import QuotationSerializer, QuotationItemSerializer


class QuotationViewSet(viewsets.ModelViewSet):
    queryset = Quotation.objects.all().order_by('-created_at')
    serializer_class = QuotationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'customer', 'created_by']
    search_fields = ['quote_number', 'customer__name']


class QuotationItemViewSet(viewsets.ModelViewSet):
    queryset = QuotationItem.objects.all()
    serializer_class = QuotationItemSerializer
    permission_classes = [IsAuthenticated]
