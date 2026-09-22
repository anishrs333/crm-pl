from django.db import models
from django.conf import settings


class Customer(models.Model):
    class CustomerType(models.TextChoices):
        COMPANY = 'company', 'Company / Corporate'
        INDIVIDUAL = 'individual', 'Individual'

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        VIP = 'vip', 'VIP / Key Account'

    name = models.CharField(max_length=200, db_index=True)
    contact_person = models.CharField(max_length=200, blank=True, null=True, verbose_name="Primary Contact Person")
    customer_type = models.CharField(
        max_length=20,
        choices=CustomerType.choices,
        default=CustomerType.COMPANY
    )
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True, verbose_name="GST / Tax ID")

    # Address
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    postal_code = models.CharField(max_length=20, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True
    )
    account_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='customers'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'crm_customers'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class CustomerContact(models.Model):
    """Specific contact persons working at a client company."""
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='contacts'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        db_table = 'crm_customer_contacts'

    def __str__(self):
        return f"{self.first_name} ({self.customer.name})"


class CustomerInteraction(models.Model):
    
    class InteractionType(models.TextChoices):
        CALL = 'call', 'Phone Call'
        MEETING = 'meeting', 'In-Person / Virtual Meeting'
        EMAIL = 'email', 'Email'
        NOTE = 'note', 'General Note'

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='interactions'
    )
    interaction_type = models.CharField(
        max_length=20,
        choices=InteractionType.choices,
        default=InteractionType.NOTE
    )
    summary = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)
    interaction_date = models.DateTimeField()
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='logged_interactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crm_customer_interactions'
        ordering = ['-interaction_date']

    def __str__(self):
        return f"{self.get_interaction_type_display()} - {self.customer.name}"
