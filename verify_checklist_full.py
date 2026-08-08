import asyncio
import os
import sys
import json
import re
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

async def main():
    print("=========================================================================")
    print("      NEORENT FULL VERIFICATION CHECKLIST AUTOMATED PLAYWRIGHT TEST      ")
    print("=========================================================================\n")

    out_dir = os.path.join(os.getcwd(), "checklist_shots")
    os.makedirs(out_dir, exist_ok=True)

    results = []

    def log(step_id, feature_name, status, details=""):
        tag = "[PASS]" if status else "[FAIL]"
        msg = f"{tag} {step_id} - {feature_name}: {details}"
        print(msg)
        results.append((step_id, feature_name, status, details))

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1600, "height": 1000})
        page = await context.new_page()

        try:
            # 1. Initial Page Load
            print("--- ITEM 1: INITIAL PAGE LOAD ---")
            await page.goto("http://localhost:5173", wait_until="networkidle")
            await page.screenshot(path=os.path.join(out_dir, "01_storefront.png"))
            title_exists = await page.locator("text=NEORENT").count() > 0
            log("1.1", "Initial Page Load", title_exists, "Storefront loaded at http://localhost:5173")

            # 2. Navbar Checks
            print("\n--- ITEM 2: NAVBAR LOCATION & CURRENCY SWITCHER ---")
            nav_text = await page.locator("nav").inner_text()
            loc_badge = "📍" in nav_text and any(c in nav_text for c in ["San Francisco", "Durgapur", "US", "IN"])
            log("2.1", "Location Badge", loc_badge, f"GeoIP location badge rendered in Navbar ({nav_text.splitlines()[2] if len(nav_text.splitlines())>2 else nav_text})")

            currency_select = page.locator("select").first
            if await currency_select.count() > 0:
                # Switch to EUR
                await currency_select.select_option("EUR")
                await page.wait_for_timeout(500)
                await page.screenshot(path=os.path.join(out_dir, "02_currency_eur.png"))
                eur_price = await page.locator("text=/€/").count()
                log("2.2", "Currency Switcher (USD -> EUR)", eur_price > 0, f"Found {eur_price} product prices updated with € symbol")

                # Switch to INR
                await currency_select.select_option("INR")
                await page.wait_for_timeout(500)
                inr_price = await page.locator("text=/₹/").count()
                log("2.3", "Currency Switcher (EUR -> INR)", inr_price > 0, f"Found {inr_price} product prices updated with ₹ symbol")

                # Revert to USD
                await currency_select.select_option("USD")
                await page.wait_for_timeout(500)

            # 3. Product Details & Barcodes
            print("\n--- ITEM 3: PRODUCT CONFIG MODAL & CODE128 BARCODE ---")
            config_btn = page.locator("button:has-text('Configure')").first
            if await config_btn.count() > 0:
                await config_btn.click()
                await page.wait_for_timeout(800)
                await page.screenshot(path=os.path.join(out_dir, "03_config_modal.png"))
                
                barcode_img = page.locator("img[alt='Code128 Asset Barcode']")
                barcode_found = await barcode_img.count() > 0
                log("3.1", "Code128 Asset Barcode in Modal", barcode_found, "Code128 Asset Barcode image rendered in modal")

                # Click Submit button inside modal form to add item to cart & close modal
                submit_modal_btn = page.locator("form button[type='submit']").first
                if await submit_modal_btn.count() > 0:
                    await submit_modal_btn.click()
                    await page.wait_for_timeout(800)
            else:
                log("3.1", "Code128 Asset Barcode in Modal", False, "Configure button not found")

            # 4. Checkout & Stripe Pre-Auth Security Deposit
            print("\n--- ITEM 4: CHECKOUT & STRIPE PRE-AUTH DEPOSIT HOLD ---")
            cart_icon = page.locator("button[title='Shopping Cart']")
            if await cart_icon.count() > 0:
                await cart_icon.click()
                await page.wait_for_timeout(800)
                
                checkout_btn = page.locator("button:has-text('Checkout')")
                if await checkout_btn.count() > 0:
                    await checkout_btn.click()
                    await page.wait_for_timeout(800)
                    await page.screenshot(path=os.path.join(out_dir, "04_checkout_stripe.png"))

                    stripe_hold = await page.locator("text=Stripe Pre-Authorization").count()
                    deposit_hold = await page.locator("text=Security Deposit Hold").count()
                    log("4.1", "Stripe Pre-Authorization Hold Indicator", stripe_hold > 0 and deposit_hold > 0, "Stripe pre-authorization security deposit hold indicator verified in checkout view")
                else:
                    log("4.1", "Stripe Pre-Authorization Hold Indicator", False, "Checkout button not found")
            else:
                log("4.1", "Stripe Pre-Authorization Hold Indicator", False, "Cart button not found")

            # 5. Order Confirmation (QR Code Waybill, Code128, Invoice PDF, Weather Banner)
            print("\n--- ITEM 5: ORDER CONFIRMATION & LOGISTICS ---")
            confirmed_btn = page.locator("button:has-text('Confirmed')")
            if await confirmed_btn.count() > 0:
                await confirmed_btn.click()
                await page.wait_for_timeout(800)

                pay_now = page.locator("button:has-text('Pay Now')")
                if await pay_now.count() > 0:
                    await pay_now.click()
                    await page.wait_for_timeout(1500)
                    await page.screenshot(path=os.path.join(out_dir, "05_order_confirmation.png"))

                    qr_waybill = await page.locator("img[alt='Waybill QR Code']").count() > 0
                    code128_asset = await page.locator("img[alt='Code128 Asset Barcode']").count() > 0
                    pdf_btn = await page.locator("button:has-text('Download Invoice PDF')").count() > 0
                    weather_banner = await page.locator("text=Weather").count() > 0 or await page.locator("text=Optimal Delivery").count() > 0

                    log("5.1", "Printable QR Code Waybill", qr_waybill, "QR Server Waybill QR Code rendered")
                    log("5.2", "Order Code128 Asset Barcode", code128_asset, "BWIP-JS Code128 Asset Barcode rendered")
                    log("5.3", "Download Invoice PDF Button", pdf_btn, "Download Invoice PDF button rendered")
                    log("5.4", "Weather Logistics Status Banner", weather_banner, "Weather logistics status flag banner rendered")

            # 6. Admin Dashboard Enterprise Extensions
            print("\n--- ITEM 6: ADMIN DASHBOARD ENTERPRISE EXTENSIONS ---")
            await page.goto("http://localhost:5173", wait_until="networkidle")
            await page.wait_for_timeout(500)

            # Avatar -> Settings (Admin Hub)
            avatar = page.locator("button:has(div.bg-gradient-to-tr), button.rounded-full:has(div)").first
            if await avatar.count() > 0:
                await avatar.click()
                await page.wait_for_timeout(500)
                
                admin_hub_btn = page.locator("button:has-text('Settings (Admin Hub)')")
                if await admin_hub_btn.count() > 0:
                    await admin_hub_btn.click()
                    await page.wait_for_timeout(1500)
                    await page.screenshot(path=os.path.join(out_dir, "06_admin_hub.png"))

                    # Products tab & Import External Catalog button
                    prod_tab = page.locator("button.tracking-wider").filter(has_text=re.compile(r"^\s*Product\s*$", re.I))
                    if await prod_tab.count() > 0:
                        await prod_tab.first.click()
                        await page.wait_for_timeout(800)
                        await page.screenshot(path=os.path.join(out_dir, "07_admin_products.png"))
                        
                        import_btn = page.locator("button:has-text('Import External Catalog')")
                        import_exists = await import_btn.count() > 0
                        log("6.1", "Import External Catalog Button", import_exists, "🌐 Import External Catalog button verified in Products tab")
                        if import_exists:
                            await import_btn.click()
                            await page.wait_for_timeout(1000)

                    # IoT Tracking Top Tab
                    iot_tab = page.locator("button.tracking-wider").filter(has_text=re.compile(r"^\s*IoT Tracking\s*$", re.I))
                    if await iot_tab.count() > 0:
                        await iot_tab.first.click()
                        await page.wait_for_timeout(800)
                        await page.screenshot(path=os.path.join(out_dir, "08_admin_iot.png"))
                        iot_cards = await page.locator("text=IOT-ASSET").count()
                        log("6.2", "IoT Tracking GPS Telemetry Cards", iot_cards > 0, f"IoT Tracking tab rendered {iot_cards} telemetry device cards")

                    # Audit Trail Top Tab
                    audit_tab = page.locator("button.tracking-wider").filter(has_text=re.compile(r"^\s*Audit Trail\s*$", re.I))
                    if await audit_tab.count() > 0:
                        await audit_tab.first.click()
                        await page.wait_for_timeout(800)
                        await page.screenshot(path=os.path.join(out_dir, "09_admin_audit.png"))
                        audit_table = await page.locator("text=Enterprise System Audit Logs").count()
                        log("6.3", "Audit Trail Logs Table", audit_table > 0, "Audit Trail enterprise system logs table verified")

        except Exception as e:
            print(f"Test Exception: {e}")

        await browser.close()

    print("\n=========================================================================")
    print("                    CHECKLIST VERIFICATION SUMMARY                       ")
    print("=========================================================================")
    passed = sum(1 for r in results if r[2])
    total = len(results)
    print(f"Total Checklist Items Evaluated: {total} | PASSED: {passed} | FAILED: {total - passed}")

if __name__ == "__main__":
    asyncio.run(main())
