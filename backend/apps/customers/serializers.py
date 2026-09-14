from rest_framework import serializers
from .models import Customer, CustomerContact, CustomerInteraction


class CustomerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerContact
        fields = ['id', 'customer', 'first_name', 'last_name', 'designation', 'email', 'phone', 'is_primary']
        read_only_fields = ['id']


class CustomerInteractionSerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    interaction_type_label = serializers.CharField(source='get_interaction_type_display', read_only=True)

    class Meta:
        model = CustomerInteraction
        fields = [
            'id',
            'customer',
            'interaction_type',
            'interaction_type_label',
            'summary',
            'details',
            'interaction_date',
            'logged_by',
            'logged_by_name',
            'created_at',
        ]
        read_only_fields = ['id', 'logged_by', 'created_at']


class CustomerListSerializer(serializers.ModelSerializer):
    account_manager_name = serializers.CharField(source='account_manager.get_full_name', read_only=True)
    customer_type_label = serializers.CharField(source='get_customer_type_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'customer_type',
            'customer_type_label',
            'email',
            'phone',
            'city',
            'status',
            'status_label',
            'account_manager',
            'account_manager_name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class CustomerDetailSerializer(serializers.ModelSerializer):
    contacts = CustomerContactSerializer(many=True, read_only=True)
    interactions = CustomerInteractionSerializer(many=True, read_only=True)
    account_manager_name = serializers.CharField(source='account_manager.get_full_name', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'customer_type',
            'email',
            'phone',
            'website',
            'gst_number',
            'address',
            'city',
            'state',
            'country',
            'postal_code',
            'status',
            'account_manager',
            'account_manager_name',
            'contacts',
            'interactions',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
