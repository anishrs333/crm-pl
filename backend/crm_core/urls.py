from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from apps.users.views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path('api/users/', include('apps.users.urls')),
    path('api/leads/', include('apps.leads.urls')),
    path('api/customers/', include('apps.customers.urls')),
    path('api/opportunities/', include('apps.opportunities.urls')),
    path('api/quotations/', include('apps.quotations.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/tasks/', include('apps.tasks.urls')),
    path('api/reports/', include('apps.reports.urls')),
]