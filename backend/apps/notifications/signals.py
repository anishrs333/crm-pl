from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.leads.models import Lead
from apps.tasks.models import Task
from apps.quotations.models import Quotation
from .models import Notification


@receiver(post_save, sender=Lead)
def notify_lead_assigned(sender, instance, created, **kwargs):
    if instance.assigned_to:
        company_display = getattr(instance, 'company_name', None) or 'N/A'
        first_name = instance.first_name or ''
        last_name = instance.last_name or ''
        full_name = f"{first_name} {last_name}".strip() or 'Lead'
        Notification.objects.create(
            recipient=instance.assigned_to,
            title="New Lead Assigned",
            message=f"You have been assigned to lead '{full_name}' ({company_display}).",
            notification_type=Notification.NotificationType.LEAD,
            link_url="/leads"
        )


@receiver(post_save, sender=Task)
def notify_task_created(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        Notification.objects.create(
            recipient=instance.assigned_to,
            title="New Task Assigned",
            message=f"Task '{instance.title}' has been assigned to you. Due date: {instance.due_date or 'N/A'}.",
            notification_type=Notification.NotificationType.TASK,
            link_url=f"/tasks"
        )


@receiver(post_save, sender=Quotation)
def notify_quotation_status_change(sender, instance, created, **kwargs):
    if not created and instance.created_by:
        cust_name = instance.customer.name if instance.customer else getattr(instance, 'customer_name', 'Client')
        Notification.objects.create(
            recipient=instance.created_by,
            title=f"Quotation {instance.quote_number} Status Updated",
            message=f"Quotation status for '{cust_name}' changed to {instance.get_status_display()}.",
            notification_type=Notification.NotificationType.QUOTATION,
            link_url=f"/quotations"
        )
