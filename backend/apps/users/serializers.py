from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'name': self.user.get_full_name() or self.user.username,
            'role': self.user.role,
           'department': self.user.department,
'is_superuser': self.user.is_superuser,
        }
        return data


class UserListSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source='get_role_display', read_only=True)
    assigned_leads_count = serializers.SerializerMethodField()
    assigned_customers_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'role_label',
            'phone',
            'department',
            'designation',
            'is_active',
            'date_joined',
            'assigned_leads_count',
            'assigned_customers_count',
        ]
        read_only_fields = ['id', 'date_joined']

    def get_assigned_leads_count(self, obj):
        return getattr(obj, 'assigned_leads', None).count() if hasattr(obj, 'assigned_leads') else 0

    def get_assigned_customers_count(self, obj):
        return getattr(obj, 'customers', None).count() if hasattr(obj, 'customers') else 0


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'role',
            'phone',
            'department',
            'designation',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'department',
            'designation',
            'role',
            'role_label',
        ]
        read_only_fields = ['id', 'username', 'role']
