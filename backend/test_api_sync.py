import urllib.request
import json

print("--- STARTING API ENDPOINT SYNC TEST ---")
api_base = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", data=None):
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
                return json.loads(res_content) if res_content else {}
            else:
                print(f"Error: Received status {response.status}")
                return None
    except Exception as e:
        print(f"HTTP Request failed: {e}")
        return None

# 1. Fetch Products
print("\n[1] Fetching products list...")
products = make_request(f"{api_base}/products")
if products is not None:
    print(f"Success! Fetched {len(products)} products.")
    for p in products[:2]:
        print(f" - {p['name']} (Type: {p['product_type']}, Rate: ${p['price'].get('day')}/day)")
else:
    print("Failed to fetch products!")
    exit(1)

# 2. Fetch Attributes
print("\n[2] Fetching variations attributes...")
attrs = make_request(f"{api_base}/attributes")
if attrs is not None:
    print(f"Success! Fetched {len(attrs)} attributes.")
    for a in attrs:
        print(f" - Attribute: {a['name']}, Type: {a['display_type']}")
else:
    print("Failed to fetch attributes!")
    exit(1)

# 3. Create a Rental Order
print("\n[3] Testing Rental Order synchronization...")
test_order = {
    "orderId": "S00099",
    "customerName": "DOM Tester",
    "customerEmail": "dom.tester@example.com",
    "customerPhone": "+1 (555) 019-9999",
    "deliveryMethod": "Standard Delivery",
    "status": "QUOTATION",
    "totalAmount": 450.00,
    "rentalPeriodStart": "2026-01-05",
    "rentalPeriodEnd": "2026-01-11",
    "deliveryAddress": {
        "fullName": "DOM Tester",
        "phone": "+1 (555) 019-9999",
        "addressLine": "999 DOM Street",
        "city": "San Francisco",
        "zipCode": "94103",
        "country": "United States"
    },
    "billingAddress": {
        "fullName": "DOM Tester",
        "phone": "+1 (555) 019-9999",
        "addressLine": "999 DOM Street",
        "city": "San Francisco",
        "zipCode": "94103",
        "country": "United States"
    },
    "orderLines": [
        { "productId": "prod-1", "productName": "AetherWave 34\" Curved Monitor", "quantity": 1, "unitPrice": 25.00, "taxPercent": 10.00, "total": 150.00 }
    ],
    "paymentDetails": {},
    "invoices": []
}

created_order = make_request(f"{api_base}/orders", method="POST", data=test_order)
if created_order:
    print(f"Success! Posted new order S00099 to backend.")
else:
    print("Failed to post order!")
    exit(1)

# 4. Fetch Orders to verify it exists
print("\n[4] Querying orders database...")
orders = make_request(f"{api_base}/orders")
if orders:
    order_ids = [o["orderId"] for o in orders]
    print(f"Current orders list: {order_ids}")
    assert "S00099" in order_ids
    print("Database sync verification complete!")
else:
    print("Failed to verify order storage!")
    exit(1)

# 5. Delete the test order
print("\n[5] Cleaning up test order...")
cleanup = make_request(f"{api_base}/orders/S00099", method="DELETE")
if cleanup:
    print("Success! Test order S00099 removed from database.")
else:
    print("Failed to delete order!")
    exit(1)

print("\n--- ALL API & SQLite3 DATABASES OPERATING IN SYNC ---")
