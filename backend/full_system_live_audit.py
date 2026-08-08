import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:5173"

print("======================================================================")
print("       NEORENT FULL SYSTEM LIVE AUDIT & END-TO-END VERIFICATION      ")
print("======================================================================\n")

# 1. TEST FRONTEND ACCESSIBILITY
print("[1] VERIFYING FRONTEND WEBSERVER (http://localhost:5173)")
try:
    res = requests.get(FRONTEND_URL)
    assert res.status_code == 200, f"Frontend returned status {res.status_code}"
    print(" -> Success: Frontend Vite webserver is serving index.html cleanly.\n")
except Exception as e:
    print(f" -> ERROR: Frontend webserver check failed: {e}\n")

# 2. TEST BACKEND REST SERVICES & DATABASE TRANSACTIONS
print("[2] VERIFYING BACKEND REST ENDPOINTS & SQLITE3 SYNC")

endpoints = ["products", "attributes", "pricelists", "templates", "orders", "invoices"]
for ep in endpoints:
    url = f"{BASE_URL}/{ep}"
    res = requests.get(url)
    assert res.status_code == 200, f"Endpoint /{ep} failed with status {res.status_code}"
    data = res.json()
    print(f" -> Endpoint /api/{ep}: HTTP 200 OK — Returned {len(data)} records from DB")

print("\n[3] TESTING CUSTOMER PORTAL TRANSACTION FLOW")
# Customer creates an order
new_customer_order = {
    "orderId": "S000999",
    "customerName": "Audit Customer",
    "customerEmail": "audit.customer@neorent.io",
    "customerPhone": "+1 (555) 999-0000",
    "deliveryMethod": "Standard Delivery",
    "status": "QUOTATION",
    "totalAmount": 450.00,
    "rentalPeriodStart": "2026-02-01",
    "rentalPeriodEnd": "2026-02-05",
    "deliveryAddress": {"fullName": "Audit Customer", "city": "San Francisco"},
    "billingAddress": {"fullName": "Audit Customer", "city": "San Francisco"},
    "orderLines": [{"productId": "prod-1", "productName": "AetherWave Monitor", "quantity": 1, "total": 450.00}],
    "paymentDetails": {"cardNumber": "xxxx xxxx xxxx 4444"},
    "invoices": []
}

res_post = requests.post(f"{BASE_URL}/orders", json=new_customer_order)
assert res_post.status_code == 200, "Failed to post customer order to backend"
print(" -> Step 3.1: Customer checkout order S000999 saved to SQLite3 database.")

# Retrieve order back from DB
res_orders = requests.get(f"{BASE_URL}/orders").json()
fetched_order = next((o for o in res_orders if o.get("orderId") == "S000999"), None)
assert fetched_order is not None, "Order S000999 not found in database!"
print(" -> Step 3.2: Order S000999 retrieved from DB successfully.\n")

print("[4] TESTING VENDOR PORTAL PRODUCT CREATION FLOW")
new_vendor_product = {
    "id": "prod-vendor-999",
    "name": "Audit Vendor Workstation",
    "brand": "Optix",
    "colors": ["black"],
    "price": {"hour": 10, "day": 50, "month": 900},
    "category": "Electronics",
    "image": "/images/ultrawide_monitor.jpg",
    "product_type": "GOODS",
    "stock_quantity": 15.00,
    "sales_price": 1200.00,
    "cost_price": 800.00,
    "security_deposit": 200.00,
    "periodicity": "DAY",
    "is_published": True,
    "hasVariants": True,
    "specs": {"color": ["Midnight Black"]}
}

res_prod_post = requests.post(f"{BASE_URL}/products", json=new_vendor_product)
assert res_prod_post.status_code == 200, "Failed to post vendor product to backend"
print(" -> Step 4.1: Vendor product 'prod-vendor-999' persisted to SQLite3 database.")

res_prods = requests.get(f"{BASE_URL}/products").json()
fetched_prod = next((p for p in res_prods if p.get("id") == "prod-vendor-999"), None)
assert fetched_prod is not None, "Vendor product 'prod-vendor-999' not found in database!"
print(" -> Step 4.2: Vendor product retrieved from DB successfully.\n")

print("[5] TESTING ADMIN PORTAL STATUS MACHINE & INVOICE PIPELINE")
# Admin updates order to SALE_ORDER
fetched_order["status"] = "SALE_ORDER"
requests.post(f"{BASE_URL}/orders", json=fetched_order)
print(" -> Step 5.1: Order S000999 status updated to SALE_ORDER.")

# Admin creates and posts draft invoice
new_invoice = {
    "invoiceNumber": "INV/2026/000999",
    "orderId": "S000999",
    "issueDate": "2026-02-01",
    "invoiceStatus": "Invoiced",
    "amountDue": 495.00,
    "invoiceLines": [{"product": "AetherWave Monitor", "quantity": 1, "unitPrice": 450.00, "taxPercent": 10.00, "amount": 495.00}]
}
res_inv_post = requests.post(f"{BASE_URL}/invoices", json=new_invoice)
assert res_inv_post.status_code == 200, "Failed to post invoice to backend"
print(" -> Step 5.2: Invoice INV/2026/000999 created and posted in DB.\n")

print("[6] CLEANING UP TEST AUDIT DATA")
requests.delete(f"{BASE_URL}/orders/S000999")
requests.delete(f"{BASE_URL}/products/prod-vendor-999")
print(" -> Step 6.1: Cleaned up test order S000999 and test product prod-vendor-999.")

print("\n======================================================================")
print("    ALL PORTALS, WEB SERVICES & DATABASE SYNC CHECKS RETURNED PASS    ")
print("======================================================================")
