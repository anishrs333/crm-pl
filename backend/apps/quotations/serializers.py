from decimal import Decimal
from rest_framework import serializers
from apps.customers.serializers import CustomerListSerializer
from .models import Quotation, QuotationItem


class QuotationItemSerializer(serializers.ModelSerializer):
    line_subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    line_tax = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = QuotationItem
        fields = [
            'id',
            'product',
            'description',
            'quantity',
            'unit_price',
            'tax_percentage',
            'line_subtotal',
            'line_tax',
            'line_total',
        ]
        read_only_fields = ['id']


class QuotationListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'quote_number',
            'customer',
            'customer_name',
            'status',
            'status_label',
            'valid_until',
            'subtotal',
            'tax_amount',
            'grand_total',
            'created_by',
            'created_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'quote_number', 'created_at']


class QuotationDetailSerializer(serializers.ModelSerializer):
    customer_details = CustomerListSerializer(source='customer', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'quote_number',
            'customer',
            'customer_details',
            'opportunity',
            'status',
            'valid_until',
            'subtotal',
            'tax_amount',
            'grand_total',
            'terms_and_conditions',
            'notes',
            'items',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'quote_number', 'subtotal', 'tax_amount', 'grand_total', 'created_at', 'updated_at']


class QuotationCreateUpdateSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, required=False)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'customer',
            'opportunity',
            'status',
            'valid_until',
            'terms_and_conditions',
            'notes',
            'items',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        count = Quotation.objects.count() + 1
        quote_number = f"QT-2026-{count:04d}"
        
        quotation = Quotation.objects.create(quote_number=quote_number, **validated_data)
        
        for item_data in items_data:
            QuotationItem.objects.create(quotation=quotation, **item_data)
            
        quotation.recalculate_totals()
        return quotation
