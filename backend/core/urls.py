from rest_framework.routers import DefaultRouter
from .views import (ProductAttributeViewSet, ProductViewSet, PricelistViewSet, 
                    QuotationTemplateViewSet, VendorOrderViewSet, InvoiceViewSet)

router = DefaultRouter()
router.register(r'attributes', ProductAttributeViewSet, basename='attribute')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'pricelists', PricelistViewSet, basename='pricelist')
router.register(r'templates', QuotationTemplateViewSet, basename='template')
router.register(r'orders', VendorOrderViewSet, basename='order')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = router.urls
