from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SavedReport
from .serializers import SavedReportSerializer
from apps.leads.models import Lead
from apps.customers.models import Customer
from apps.opportunities.models import Opportunity
from apps.tasks.models import Task


class SavedReportViewSet(viewsets.ModelViewSet):
    queryset = SavedReport.objects.all().order_by('-created_at')
    serializer_class = SavedReportSerializer
    permission_classes = [IsAuthenticated]


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_leads = Lead.objects.count()
        total_customers = Customer.objects.count()
        total_opportunities = Opportunity.objects.count()
        open_tasks = Task.objects.exclude(status='completed').count()

        return Response({
            'total_leads': total_leads,
            'total_customers': total_customers,
            'total_opportunities': total_opportunities,
            'open_tasks': open_tasks,
        })
