from rest_framework import serializers
from .models import Lead, LeadNote


class LeadNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = LeadNote
        fields = ['id', 'lead', 'note', 'author', 'author_name', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class LeadListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    source_label = serializers.CharField(source='get_source_display', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'company_name',
            'designation',
            'source',
            'source_label',
            'status',
            'status_label',
            'priority',
            'priority_label',
            'estimated_budget',
            'follow_up_date',
            'assigned_to',
            'assigned_to_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_email(self, value):
        if value:
            return value.strip().lower()
        return value


class LeadDetailSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    timeline_notes = LeadNoteSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'company_name',
            'designation',
            'source',
            'status',
            'priority',
            'estimated_budget',
            'notes',
            'follow_up_date',
            'assigned_to',
            'assigned_to_name',
            'created_by',
            'created_by_name',
            'converted_at',
            'timeline_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'converted_at', 'created_at', 'updated_at']


class LeadConvertSerializer(serializers.Serializer):
    deal_title = serializers.CharField(max_length=200, required=False)
    deal_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    expected_close_date = serializers.DateField(required=False)
