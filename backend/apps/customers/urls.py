from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerContactViewSet

router = DefaultRouter()
router.register(r'contacts', CustomerContactViewSet, basename='customer-contact')
router.register(r'', CustomerViewSet, basename='customer')

urlpatterns = [
    path('', include(router.urls)),
]
