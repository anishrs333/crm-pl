from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        LEAD = 'lead', 'Lead Alert'
        QUOTATION = 'quotation', 'Quotation Alert'
        TASK = 'task', 'Task Reminder'
        OPPORTUNITY = 'opportunity', 'Opportunity Update'
        SYSTEM = 'system', 'System Notice'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True
    )
    is_read = models.BooleanField(default=False, db_index=True)
    link_url = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'crm_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.title} ({'Read' if self.is_read else 'Unread'})"
