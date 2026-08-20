from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Opportunity
from .serializers import OpportunitySerializer


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all().order_by('-created_at')
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['stage', 'customer', 'assigned_to']
    search_fields = ['title', 'customer__name']
