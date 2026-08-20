from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Sales Manager'),
        ('sales_rep', 'Sales Representative'),
        ('support', 'Support'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_rep')
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
