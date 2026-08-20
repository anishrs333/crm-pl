"""
URL configuration for crm_core project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # CRM Apps API endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/leads/', include('apps.leads.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/opportunities/', include('apps.opportunities.urls')),
    path('api/quotations/', include('apps.quotations.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/reports/', include('apps.reports.urls')),
]
