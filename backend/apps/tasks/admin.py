from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'status', 'assigned_to', 'due_date', 'created_at')
    list_filter = ('priority', 'status', 'assigned_to')
    search_fields = ('title', 'description')
