from rest_framework.permissions import BasePermission


class IsLeadOwnerOrManager(BasePermission):
    """
    Ensures Sales Reps can only view/edit leads assigned to or created by them.
    Admins and Sales Managers have full organization access.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_manager:
            return True
        return obj.assigned_to == user or obj.created_by == user
