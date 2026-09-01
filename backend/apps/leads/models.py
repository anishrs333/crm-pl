from django.db import models
from django.conf import settings


class Lead(models.Model):
    class Source(models.TextChoices):
        WEBSITE = 'website', 'Website Inbound'
        REFERRAL = 'referral', 'Client Referral'
        LINKEDIN = 'linkedin', 'LinkedIn / Social'
        COLD_CALL = 'cold_call', 'Cold Outreach'
        CAMPAIGN = 'campaign', 'Marketing Campaign'
        EVENT = 'event', 'Trade Show / Event'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        QUALIFIED = 'qualified', 'Qualified'
        UNQUALIFIED = 'unqualified', 'Unqualified'
        CONVERTED = 'converted', 'Converted to Customer'

    class Priority(models.TextChoices):
        HOT = 'hot', 'Hot (High Intent)'
        WARM = 'warm', 'Warm (Medium Intent)'
        COLD = 'cold', 'Cold (Low Intent)'

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(db_index=True, blank=True, null=True)
    phone = models.CharField(max_length=30, db_index=True, blank=True, null=True)
    company_name = models.CharField(max_length=200, db_index=True, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)

    source = models.CharField(
        max_length=30,
        choices=Source.choices,
        default=Source.WEBSITE
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.WARM
    )

    estimated_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, null=True)

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_leads'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_leads'
    )

    converted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_leads'
        ordering = ['-created_at']

    def __str__(self):
        full_name = f"{self.first_name} {self.last_name or ''}".strip()
        company = f" ({self.company_name})" if self.company_name else ""
        return f"{full_name}{company}"


class LeadNote(models.Model):
    """Activity and interaction log specific to a lead timeline."""
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name='timeline_notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crm_lead_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f"Note by {self.author} on {self.lead.first_name}"