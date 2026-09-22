from decimal import Decimal
from rest_framework import serializers
from apps.customers.models import Customer
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
    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        required=False,
        allow_null=True
    )
    customer_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    items = QuotationItemSerializer(many=True, required=False)

    class Meta:
        model = Quotation
        fields = [
            'id',
            'customer',
            'customer_name',
            'opportunity',
            'status',
            'valid_until',
            'terms_and_conditions',
            'notes',
            'items',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        customer = attrs.get('customer')
        customer_name = attrs.get('customer_name')

        if not customer:
            if customer_name and customer_name.strip():
                cust, _ = Customer.objects.get_or_create(
                    name=customer_name.strip(),
                    defaults={'status': Customer.Status.ACTIVE}
                )
                attrs['customer'] = cust
            else:
                cust, _ = Customer.objects.get_or_create(
                    name="General Client",
                    defaults={'status': Customer.Status.ACTIVE}
                )
                attrs['customer'] = cust

        status_val = attrs.get('status')
        if status_val:
            status_map = {
                'Draft': 'draft',
                'Sent': 'sent',
                'Accepted': 'accepted',
                'Declined': 'rejected',
                'Rejected': 'rejected',
                'Expired': 'expired',
            }
            attrs['status'] = status_map.get(status_val, status_val.lower())

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data.pop('customer_name', None)

        latest_quote = Quotation.objects.order_by('-id').first()
        next_num = (latest_quote.id + 1) if latest_quote else 1
        quote_number = f"QT-2026-{next_num:04d}"
        while Quotation.objects.filter(quote_number=quote_number).exists():
            next_num += 1
            quote_number = f"QT-2026-{next_num:04d}"

        quotation = Quotation.objects.create(quote_number=quote_number, **validated_data)

        for item_data in items_data:
            QuotationItem.objects.create(quotation=quotation, **item_data)

        quotation.recalculate_totals()
        return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        validated_data.pop('customer_name', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                QuotationItem.objects.create(quotation=instance, **item_data)
            instance.recalculate_totals()

        return instance
