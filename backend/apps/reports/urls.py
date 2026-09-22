from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SavedReportViewSet, DashboardStatsView, GlobalSearchView

router = DefaultRouter()
router.register(r'saved', SavedReportViewSet, basename='saved-report')

urlpatterns = [
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]

