from django.contrib import admin
from .models import Lead, LeadNote


class LeadNoteInline(admin.TabularInline):
    model = LeadNote
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'first_name',
        'last_name',
        'company_name',
        'email',
        'status',
        'priority',
        'source',
        'assigned_to',
        'created_at'
    )
    list_filter = ('status', 'priority', 'source', 'assigned_to')
    search_fields = ('first_name', 'last_name', 'company_name', 'email', 'phone')
    readonly_fields = ('converted_at', 'created_at', 'updated_at')
    inlines = [LeadNoteInline]


@admin.register(LeadNote)
class LeadNoteAdmin(admin.ModelAdmin):
    list_display = ('lead', 'author', 'note', 'created_at')
    list_filter = ('author', 'created_at')
    search_fields = ('note', 'lead__first_name', 'lead__company_name')
