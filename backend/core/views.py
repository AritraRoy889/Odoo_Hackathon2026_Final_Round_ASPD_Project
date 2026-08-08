from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum
import pandas as pd
from .models import (ProductAttribute, Product, Pricelist, QuotationTemplate, RentalOrder, Invoice)
from .serializers import (ProductAttributeSerializer, ProductSerializer, PricelistSerializer, 
                          QuotationTemplateSerializer, RentalOrderSerializer, InvoiceSerializer)

class ProductAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductAttribute.objects.all()
    serializer_class = ProductAttributeSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class PricelistViewSet(viewsets.ModelViewSet):
    queryset = Pricelist.objects.all()
    serializer_class = PricelistSerializer

class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all()
    serializer_class = QuotationTemplateSerializer

class VendorOrderViewSet(viewsets.ModelViewSet):
    queryset = RentalOrder.objects.all()
    serializer_class = RentalOrderSerializer

    # --- STATE MACHINE ---
    @action(detail=True, methods=['post'])
    def send_quotation(self, request, pk=None):
        order = self.get_object()
        if order.status == 'QUOTATION':
            order.status = 'QUOTATION_SENT'
            order.save()
            return Response({'status': 'Quotation Sent'})
        return Response({'error': 'Invalid transition'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def confirm_sale(self, request, pk=None):
        order = self.get_object()
        if order.status == 'QUOTATION_SENT':
            order.status = 'SALE_ORDER'
            order.save()
            
            Invoice.objects.create(
                order=order,
                invoice_number=f"INV/2026/{order.id:04d}",
                total_amount=0, 
                billing_address="Customer Address",
                delivery_address="Delivery Address"
            )
            return Response({'status': 'Sale Order Confirmed, Draft Invoice Created'})
        return Response({'error': 'Invalid transition'}, status=status.HTTP_400_BAD_REQUEST)

    # --- DASHBOARD & SCHEDULER ---
    @action(detail=False, methods=['get'])
    def kanban_board(self, request):
        orders = self.get_queryset()
        data = {
            'TODAY': RentalOrderSerializer(orders.filter(logistics_status='TODAY'), many=True).data,
            'PICKUP': RentalOrderSerializer(orders.filter(logistics_status='PICKUP'), many=True).data,
            'RETURN': RentalOrderSerializer(orders.filter(logistics_status='RETURN'), many=True).data,
            'LATE': RentalOrderSerializer(orders.filter(logistics_status='LATE'), many=True).data,
        }
        return Response(data)

    @action(detail=False, methods=['get'])
    def scheduler(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        if month and year:
            orders = self.get_queryset().filter(rental_start_date__month=month, rental_start_date__year=year)
            return Response(RentalOrderSerializer(orders, many=True).data)
        return Response({"error": "Provide month and year"}, status=status.HTTP_400_BAD_REQUEST)

    # --- ANALYTICS & EXPORTS ---
    @action(detail=False, methods=['get'])
    def analytics(self, request):
        total_sales = self.get_queryset().filter(status='SALE_ORDER').aggregate(Sum('lines__subtotal'))['lines__subtotal__sum'] or 0
        return Response({
            'total_sales': total_sales,
            'active_orders': self.get_queryset().exclude(status='QUOTATION').count(),
            'late_returns': self.get_queryset().filter(logistics_status='LATE').count()
        })

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        orders = self.get_queryset().values('id', 'status', 'logistics_status', 'rental_start_date')
        df = pd.DataFrame(list(orders))
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="orders_report.csv"'
        df.to_csv(response, index=False)
        return response

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def post_invoice(self, request, pk=None):
        invoice = self.get_object()
        if invoice.status == 'DRAFT':
            invoice.status = 'POSTED'
            invoice.save()
            return Response({'status': 'Invoice Posted'})
        return Response({'error': 'Invoice already posted'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def print_pdf(self, request, pk=None):
        invoice = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{invoice.invoice_number}.pdf"'
        return response
