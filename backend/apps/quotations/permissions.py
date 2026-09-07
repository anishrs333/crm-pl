from rest_framework.permissions import BasePermission


class IsQuotationOwnerOrManager(BasePermission):
    
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_manager:
            return True
        return obj.created_by == user
