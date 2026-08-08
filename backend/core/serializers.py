from rest_framework import serializers
from .models import (User, VendorProfile, QuotationTemplate, ProductAttribute, ProductAttributeValue, 
                     Product, ProductVariant, Pricelist, PricelistRule, RentalOrder, OrderLineItem, Invoice)

class ProductAttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttributeValue
        fields = ['id', 'value', 'default_extra_price']

class ProductAttributeSerializer(serializers.ModelSerializer):
    values = ProductAttributeValueSerializer(many=True, required=False)

    class Meta:
        model = ProductAttribute
        fields = ['id', 'vendor', 'name', 'display_type', 'values']

    def create(self, validated_data):
        values_data = validated_data.pop('values', [])
        attribute = ProductAttribute.objects.create(**validated_data)
        for value_data in values_data:
            ProductAttributeValue.objects.create(attribute=attribute, **value_data)
        return attribute

    def update(self, instance, validated_data):
        values_data = validated_data.pop('values', None)
        instance.name = validated_data.get('name', instance.name)
        instance.display_type = validated_data.get('display_type', instance.display_type)
        instance.save()

        if values_data is not None:
            instance.values.all().delete()
            for value_data in values_data:
                ProductAttributeValue.objects.create(attribute=instance, **value_data)
        return instance

class ProductVariantSerializer(serializers.ModelSerializer):
    attribute_value = ProductAttributeValueSerializer(read_only=True)
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class PricelistRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricelistRule
        fields = '__all__'

class PricelistSerializer(serializers.ModelSerializer):
    rules = PricelistRuleSerializer(many=True, read_only=True)
    class Meta:
        model = Pricelist
        fields = '__all__'

class QuotationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationTemplate
        fields = '__all__'

class OrderLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLineItem
        fields = '__all__'

class RentalOrderSerializer(serializers.ModelSerializer):
    lines = OrderLineItemSerializer(many=True, read_only=True)
    class Meta:
        model = RentalOrder
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'
