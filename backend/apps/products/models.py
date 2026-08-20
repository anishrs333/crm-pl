from django.db import models


class Product(models.Model):
    PRODUCT_TYPE_CHOICES = (
        ('product', 'Physical Product'),
        ('service', 'Service / Subscription'),
    )

    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, unique=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default='product')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text="Tax percentage (e.g. 18.00)")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.sku})"
