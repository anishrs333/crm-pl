from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    type_label = serializers.CharField(source='get_notification_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'title',
            'message',
            'notification_type',
            'type_label',
            'is_read',
            'link_url',
            'created_at',
        ]
        read_only_fields = ['id', 'recipient', 'created_at']
