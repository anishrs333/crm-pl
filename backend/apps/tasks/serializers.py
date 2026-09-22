from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    task_type_label = serializers.CharField(source='get_task_type_display', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
