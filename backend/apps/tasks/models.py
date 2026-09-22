from django.db import models
from django.conf import settings


class Task(models.Model):
    class TaskType(models.TextChoices):
        CALL = 'call', 'Phone Call'
        MEETING = 'meeting', 'Meeting'
        EMAIL = 'email', 'Send Email'
        FOLLOW_UP = 'follow_up', 'Follow-up'
        DEMO = 'demo', 'Product Demo'
        TO_DO = 'to_do', 'General To-Do'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, default='Sales')
    task_type = models.CharField(
        max_length=20,
        choices=TaskType.choices,
        default=TaskType.TO_DO
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    due_date = models.DateTimeField(null=True, blank=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_tasks'
    )
    lead = models.ForeignKey(
        'leads.Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )
    opportunity = models.ForeignKey(
        'opportunities.Opportunity',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tasks'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_tasks'
        ordering = ['due_date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
