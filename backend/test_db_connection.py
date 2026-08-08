import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, DbProduct, DbAttribute, DbRentalOrder, DbInvoice

# Test database connection using SQLite3
print("--- STARTING DATABASE CONNECTION TEST ---")
DATABASE_URL = "sqlite:///./db.sqlite3"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # 1. VERIFY CONNECTION & SCHEMA CREATION
    print("[1] Verifying database connection...")
    connection = engine.connect()
    print("Database connection successfully established!")
    connection.close()

    # 2. CREATE (Insert Data)
    print("\n[2] Testing INSERT operation...")
    test_product = DbProduct(
        id="prod-test-99",
        name="Test Validation Laptop",
        brand="TestBrand",
        colors="black,grey",
        price=json.dumps({"hour": 10, "day": 50, "month": 500}),
        category="Electronics",
        image="/images/laptop.jpg",
        product_type="GOODS",
        stock_quantity=10.0,
        sales_price=1000.0,
        cost_price=700.0,
        security_deposit=200.0,
        periodicity="DAY",
        is_published=True,
        hasVariants=False,
        specs=json.dumps({})
    )
    db.add(test_product)
    db.commit()
    print("Product inserted successfully!")

    # 3. FETCH (Read Data)
    print("\n[3] Testing SELECT operation...")
    fetched_product = db.query(DbProduct).filter(DbProduct.id == "prod-test-99").first()
    if fetched_product:
        print(f"Product fetched successfully: {fetched_product.name} (Brand: {fetched_product.brand})")
        assert fetched_product.name == "Test Validation Laptop"
    else:
        print("Error: Product was not found!")
        exit(1)

    # 4. UPDATE (Modify Data)
    print("\n[4] Testing UPDATE operation...")
    fetched_product.brand = "BrandUpdated"
    db.commit()
    updated_product = db.query(DbProduct).filter(DbProduct.id == "prod-test-99").first()
    print(f"Product updated successfully: New Brand: {updated_product.brand}")
    assert updated_product.brand == "BrandUpdated"

    # 5. DELETE (Remove Data)
    print("\n[5] Testing DELETE operation...")
    db.delete(updated_product)
    db.commit()
    deleted_check = db.query(DbProduct).filter(DbProduct.id == "prod-test-99").first()
    if deleted_check is None:
        print("Product deleted and verified absent from database successfully!")
    else:
        print("Error: Product was not deleted!")
        exit(1)

    print("\n--- DATABASE CONNECTION & CRUD TEST SUCCESSFUL ---")

except Exception as e:
    print(f"Database verification test failed: {e}")
    db.close()
    exit(1)

finally:
    db.close()
