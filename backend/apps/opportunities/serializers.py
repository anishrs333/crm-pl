from decimal import Decimal
from rest_framework import serializers
from apps.customers.serializers import CustomerListSerializer
from .models import Opportunity


class OpportunityListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    stage_label = serializers.CharField(source='get_stage_display', read_only=True)
    weighted_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'customer',
            'customer_name',
            'amount',
            'stage',
            'stage_label',
            'probability',
            'weighted_amount',
            'expected_close_date',
            'assigned_to',
            'assigned_to_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class OpportunityDetailSerializer(serializers.ModelSerializer):
    customer_details = CustomerListSerializer(source='customer', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    stage_label = serializers.CharField(source='get_stage_display', read_only=True)
    weighted_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'customer',
            'customer_details',
            'lead',
            'amount',
            'stage',
            'stage_label',
            'probability',
            'weighted_amount',
            'expected_close_date',
            'actual_close_date',
            'lost_reason',
            'assigned_to',
            'assigned_to_name',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'actual_close_date', 'created_at', 'updated_at']


class OpportunityCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opportunity
        fields = [
            'id',
            'title',
            'customer',
            'lead',
            'amount',
            'stage',
            'probability',
            'expected_close_date',
            'lost_reason',
            'assigned_to',
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        stage = attrs.get('stage', getattr(self.instance, 'stage', None))
        lost_reason = attrs.get('lost_reason', getattr(self.instance, 'lost_reason', None))

        # Enforce business rule: Closed Lost requires a documented reason
        if stage == Opportunity.Stage.LOST and not lost_reason:
            raise serializers.ValidationError({
                "lost_reason": "A reason is required when marking an opportunity as Closed Lost."
            })
        return attrs


class CloseOpportunitySerializer(serializers.Serializer):
    """Serializer for the close_deal endpoint."""
    status = serializers.ChoiceField(choices=['won', 'lost'])
    lost_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['status'] == 'lost' and not attrs.get('lost_reason'):
            raise serializers.ValidationError({
                "lost_reason": "Please provide a reason why this deal was lost."
            })
        return attrs