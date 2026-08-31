from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin)


class IsManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_manager)


class IsOwnerOrManager(BasePermission):
   
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.is_manager:
            return True

        for attr in ('assigned_to', 'created_by', 'account_manager', 'user'):
            if hasattr(obj, attr) and getattr(obj, attr) == user:
                return True

        return obj == user