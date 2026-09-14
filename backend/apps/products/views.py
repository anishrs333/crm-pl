from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsManager

from .models import Product
from .serializers import ProductSerializer, ProductSelectSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filterset_fields = ['product_type', 'category', 'is_active']
    search_fields = ['sku', 'name', 'description']
    ordering_fields = ['name', 'unit_price', 'created_at']

    def get_serializer_class(self):
        if self.action == 'select_list':
            return ProductSelectSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsManager()]
        return [IsAuthenticated()]
