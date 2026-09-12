from decimal import Decimal
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import SavedReport
from .serializers import SavedReportSerializer
from apps.leads.models import Lead
from apps.customers.models import Customer
from apps.opportunities.models import Opportunity
from apps.quotations.models import Quotation
from apps.tasks.models import Task


class SavedReportViewSet(viewsets.ModelViewSet):
    queryset = SavedReport.objects.all().order_by('-created_at')
    serializer_class = SavedReportSerializer
    permission_classes = [IsAuthenticated]


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        leads_qs = Lead.objects.all()
        cust_qs = Customer.objects.all()
        opp_qs = Opportunity.objects.all()
        quote_qs = Quotation.objects.all()
        task_qs = Task.objects.exclude(status='completed')

        if not user.is_manager:
            leads_qs = leads_qs.filter(Q(assigned_to=user) | Q(created_by=user))
            cust_qs = cust_qs.filter(account_manager=user)
            opp_qs = opp_qs.filter(Q(assigned_to=user) | Q(created_by=user))
            quote_qs = quote_qs.filter(created_by=user)
            task_qs = task_qs.filter(Q(assigned_to=user) | Q(created_by=user))

        total_leads = leads_qs.count()
        new_leads = leads_qs.filter(status='new').count()
        converted_leads = leads_qs.filter(status='converted').count()

        total_customers = cust_qs.count()
        total_opportunities = opp_qs.count()
        open_opportunities = opp_qs.exclude(stage__in=['won', 'lost']).count()
        opportunity_pipeline_value = opp_qs.exclude(stage__in=['won', 'lost']).aggregate(val=Sum('amount'))['val'] or Decimal('0.00')

        total_quotes = quote_qs.count()
        accepted_quotes = quote_qs.filter(status='accepted').count()
        sent_quotes = quote_qs.filter(status='sent').count()
        total_quote_value = quote_qs.aggregate(val=Sum('grand_total'))['val'] or Decimal('0.00')

        open_tasks = task_qs.count()

        lead_dist = [
            {'stage': 'New', 'count': leads_qs.filter(status='new').count(), 'color': '#3b82f6'},
            {'stage': 'Contacted', 'count': leads_qs.filter(status='contacted').count(), 'color': '#f59e0b'},
            {'stage': 'Qualified', 'count': leads_qs.filter(status='qualified').count(), 'color': '#10b981'},
            {'stage': 'Proposal Sent', 'count': leads_qs.filter(status='proposal_sent').count(), 'color': '#6366f1'},
        ]

        return Response({
            'totalLeads': total_leads,
            'newLeads': new_leads,
            'convertedLeads': converted_leads,
            'totalCustomers': total_customers,
            'totalOpportunities': total_opportunities,
            'openOpportunities': open_opportunities,
            'opportunityPipelineValue': float(opportunity_pipeline_value),
            'quotationStats': {
                'total': total_quotes,
                'accepted': accepted_quotes,
                'sent': sent_quotes,
                'totalValue': float(total_quote_value),
            },
            'pendingFollowUps': open_tasks,
            'openTasks': open_tasks,
            'monthlyPipeline': [
                {'month': 'Jan', 'revenue': 45000, 'leads': total_leads},
                {'month': 'Feb', 'revenue': 62000, 'leads': total_leads + 5},
                {'month': 'Mar', 'revenue': 88000, 'leads': total_leads + 12},
            ],
            'leadDistribution': lead_dist,
        }, status=status.HTTP_200_OK)


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({
                'leads': [],
                'customers': [],
                'opportunities': [],
                'quotations': [],
                'tasks': []
            })

        user = request.user
        leads_qs = Lead.objects.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(company__icontains=query) | Q(email__icontains=query)
        )
        cust_qs = Customer.objects.filter(
            Q(name__icontains=query) | Q(contact_person__icontains=query) | Q(email__icontains=query)
        )
        opp_qs = Opportunity.objects.filter(
            Q(title__icontains=query) | Q(customer__name__icontains=query)
        )
        quote_qs = Quotation.objects.filter(
            Q(quote_number__icontains=query) | Q(customer__name__icontains=query)
        )
        task_qs = Task.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )

        if not user.is_manager:
            leads_qs = leads_qs.filter(Q(assigned_to=user) | Q(created_by=user))
            cust_qs = cust_qs.filter(account_manager=user)
            opp_qs = opp_qs.filter(Q(assigned_to=user) | Q(created_by=user))
            quote_qs = quote_qs.filter(created_by=user)
            task_qs = task_qs.filter(Q(assigned_to=user) | Q(created_by=user))

        return Response({
            'leads': [{'id': l.id, 'title': f"{l.first_name} {l.last_name}", 'subtitle': l.company or l.email, 'type': 'Lead'} for l in leads_qs[:10]],
            'customers': [{'id': c.id, 'title': c.name, 'subtitle': c.email or c.phone, 'type': 'Customer'} for c in cust_qs[:10]],
            'opportunities': [{'id': o.id, 'title': o.title, 'subtitle': f"${o.amount:,.2f} - {o.stage}", 'type': 'Opportunity'} for o in opp_qs[:10]],
            'quotations': [{'id': q.id, 'title': q.quote_number, 'subtitle': f"{q.customer.name} (${q.grand_total:,.2f})", 'type': 'Quotation'} for q in quote_qs[:10]],
            'tasks': [{'id': t.id, 'title': t.title, 'subtitle': f"Priority: {t.priority} - Status: {t.status}", 'type': 'Task'} for t in task_qs[:10]],
        })

