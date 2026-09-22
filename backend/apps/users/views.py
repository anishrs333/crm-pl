from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsAdmin, IsManager
from .serializers import (
    LoginSerializer,
    UserListSerializer,
    CreateUserSerializer,
    ProfileSerializer,
)


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    filterset_fields = ['role', 'department', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        if self.action in ('me', 'update_me'):
            return ProfileSerializer
        return UserListSerializer

    def get_permissions(self):
        if self.action in ('create', 'destroy'):
            return [IsAdmin()]
        if self.action in ('list', 'retrieve', 'update', 'partial_update'):
            return [IsManager()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'GET':
            serializer = ProfileSerializer(request.user)
            return Response(serializer.data)

        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        new_password = request.data.get('password')
        if new_password and str(new_password).strip():
            user.set_password(str(new_password).strip())
            user.save()
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='set-password')
    def set_password(self, request, pk=None):
        user = self.get_object()
        if not (request.user.is_admin or request.user == user):
            return Response(
                {'message': 'Permission denied. Only administrators can change other users passwords.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_password = request.data.get('password')
        if not new_password or len(str(new_password).strip()) < 4:
            return Response(
                {'password': ['Password must be at least 4 characters long.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(str(new_password).strip())
        user.save()
        return Response(
            {'message': f'Password updated successfully for user {user.username}.'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password') or request.data.get('current_password')
        new_password = request.data.get('new_password') or request.data.get('password')

        if old_password and not user.check_password(str(old_password).strip()):
            return Response(
                {'message': 'Current password is incorrect. Please verify and try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_password or len(str(new_password).strip()) < 4:
            return Response(
                {'message': 'New password must be at least 4 characters long.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(str(new_password).strip())
        user.save()
        return Response(
            {'message': 'Password changed successfully.'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        if hasattr(request, 'session'):
            django_logout(request)
        response = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response
