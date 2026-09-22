from rest_framework.permissions import BasePermission


class IsOpportunityOwnerOrManager(BasePermission):
    """
    Data Scoping:
    - Sales Reps: Access only opportunities assigned to or created by them.
    - Managers & Admins: Full access to all deals across the organization.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_manager:
            return True
        return obj.assigned_to == user or obj.created_by == user