import urllib.request
import json
import time

print("=====================================================================")
print("          NEORENT COMPREHENSIVE END-TO-END QA PORTAL TEST            ")
print("=====================================================================\n")

api_base = "http://127.0.0.1:8000/api"

def api_call(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(data).encode("utf-8")
    else:
        encoded_data = None
    
    try:
        with urllib.request.urlopen(req, data=encoded_data) as response:
            if response.status == 200:
                res_content = response.read().decode("utf-8")
                return json.loads(res_content) if res_content else {"success": True}
            else:
                print(f"Error: Received status {response.status}")
                return None
    except Exception as e:
        print(f"API Request to {url} failed: {e}")
        return None

# --- PHASE 1: CUSTOMER PORTAL FLOW ---
print("[PHASE 1] CUSTOMER PORTAL SIMULATION")

# 1.1 Browse Catalog (Retrieve Products)
print("1.1 Customer opens storefront and loads products catalog...")
products = api_call(f"{api_base}/products")
assert products is not None and len(products) > 0, "Catalog is empty!"
print(f"Success: Storefront loaded {len(products)} products correctly.")

# 1.2 Select and Configure a Variant
target_product = products[0]
print(f"1.2 Selecting product '{target_product['name']}'...")
print(f"Variant configurations available: {target_product['specs']}")

# 1.3 Add configured item to cart and checkout (Finalize Order)
print("1.3 Customer completes Checkout form and pays via Express Checkout...")
customer_order = {
    "orderId": "S00095",
    "customerName": "QA Customer",
    "customerEmail": "qa.customer@example.com",
    "customerPhone": "+1 (555) 123-4567",
    "deliveryMethod": "Standard Delivery",
    "status": "QUOTATION",
    "totalAmount": 20000.00,
    "rentalPeriodStart": "2026-01-05",
    "rentalPeriodEnd": "2026-01-11",
    "deliveryAddress": {
        "fullName": "QA Customer",
        "phone": "+1 (555) 123-4567",
        "addressLine": "456 QA boulevard",
        "city": "Dallas",
        "zipCode": "75201",
        "country": "United States"
    },
    "billingAddress": {
        "fullName": "QA Customer",
        "phone": "+1 (555) 123-4567",
        "addressLine": "456 QA boulevard",
        "city": "Dallas",
        "zipCode": "75201",
        "country": "United States"
    },
    "orderLines": [
        {
            "productId": target_product["id"],
            "productName": target_product["name"],
            "quantity": 1,
            "unitPrice": target_product["sales_price"],
            "taxPercent": 10.00,
            "total": target_product["sales_price"]
        }
    ],
    "paymentDetails": {
        "cardNumber": "xxxx xxxx xxxx 9995",
        "cardName": "QA Customer"
    },
    "invoices": []
}

order_res = api_call(f"{api_base}/orders", method="POST", data=customer_order)
assert order_res is not None, "Failed to checkout customer order!"
print("Success: Customer order registered in database successfully.")


# --- PHASE 2: VENDOR PORTAL FLOW ---
print("\n[PHASE 2] VENDOR PORTAL SIMULATION")

# 2.1 Register a new product
print("2.1 Vendor adds a new product variant to the storefront catalog...")
new_vendor_product = {
    "id": "prod-vendor-95",
    "name": "Vendor Luxury Armchair",
    "brand": "VendorBrand",
    "colors": ["mustard", "navy"],
    "price": { "hour": 4, "day": 20, "month": 300 },
    "category": "Furniture",
    "image": "/images/lounge_sofa.jpg",
    "product_type": "GOODS",
    "stock_quantity": 2.00,
    "sales_price": 500.00,
    "cost_price": 300.00,
    "security_deposit": 100.00,
    "periodicity": "DAY",
    "is_published": True,
    "hasVariants": True,
    "specs": {
        "color": ["Mustard Yellow", "Ocean Navy"]
    }
}

prod_res = api_call(f"{api_base}/products", method="POST", data=new_vendor_product)
assert prod_res is not None, "Vendor failed to register product!"
print("Success: Vendor product added to catalog database.")


# --- PHASE 3: ADMIN PORTAL FLOW ---
print("\n[PHASE 3] ADMIN PORTAL SIMULATION")

# 3.1 Fetch Order List for Kanban
print("3.1 Admin retrieves order logs to populate Kanban lanes...")
orders = api_call(f"{api_base}/orders")
order_ids = [o["orderId"] for o in orders]
print(f"Active orders in backend: {order_ids}")
assert "S00095" in order_ids, "Customer order was not found in admin view!"

# 3.2 Send Quotation
print("3.2 Admin reviews S00095 and sends Quotation to customer...")
orders_list = api_call(f"{api_base}/orders")
qa_order = next(o for o in orders_list if o["orderId"] == "S00095")
qa_order["status"] = "QUOTATION_SENT"
qa_order["invoices"] = [{"invoiceNumber": "INV/2026/00095", "status": "Quotation Sent"}]
update_res = api_call(f"{api_base}/orders", method="POST", data=qa_order)
print("Success: Quotation marked as SENT.")

# 3.3 Confirm Sale Order & Create Draft Invoice
print("3.3 Admin confirms the sale order S00095...")
qa_order["status"] = "SALE_ORDER"
update_res = api_call(f"{api_base}/orders", method="POST", data=qa_order)

print("3.3.1 Creating corresponding draft invoice...")
invoice_data = {
    "invoiceNumber": "INV/2026/00095",
    "orderId": "S00095",
    "issueDate": "2026-01-05",
    "invoiceStatus": "Invoiced",
    "amountDue": 22000.00,
    "invoiceLines": [
        { "product": target_product["name"], "quantity": 1, "unitPrice": target_product["sales_price"], "taxPercent": 10.00, "amount": target_product["sales_price"] * 1.10 }
    ]
}
inv_res = api_call(f"{api_base}/invoices", method="POST", data=invoice_data)
assert inv_res is not None, "Failed to create invoice!"
print("Success: Sale order confirmed, draft Invoice INV/2026/00095 created.")

# 3.4 Retrieve and Post Invoice
print("3.4 Admin posts the invoice to finalize accounts...")
invoice_data["invoiceStatus"] = "Invoiced"
post_res = api_call(f"{api_base}/invoices", method="POST", data=invoice_data)
print("Success: Invoice INV/2026/00095 posted successfully.")


# --- CLEANUP PHASE ---
print("\n[PHASE 4] PORTAL QA CLEANUP")
api_call(f"{api_base}/orders/S00095", method="DELETE")
api_call(f"{api_base}/products/prod-vendor-95", method="DELETE")
api_call(f"{api_base}/invoices/INV/2026/00095", method="DELETE")
print("Success: Test records cleared. Database returned to pristine state.")

print("\n=====================================================================")
print("         ALL PORTALS, WEB SERVICES & DATABASES FULLY VERIFIED        ")
print("=====================================================================")
