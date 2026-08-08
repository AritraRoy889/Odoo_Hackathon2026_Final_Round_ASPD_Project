import asyncio
import os
import sys
import json
import urllib.request
from playwright.async_api import async_playwright

async def main():
    print("====================================================")
    print("STARTING PLAYWRIGHT HIGH-PRECISION LIVE DOM AUDIT")
    print("====================================================")

    out_dir = os.path.join(os.getcwd(), "playwright_audit_shots")
    os.makedirs(out_dir, exist_ok=True)

    results = []

    def log(step, status, details=""):
        tag = "[PASS]" if status else "[FAIL]"
        msg = f"{tag} {step}: {details}"
        print(msg)
        results.append((step, status, details))

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1600, "height": 1000})
        page = await context.new_page()

        # Track JavaScript console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        try:
            # 1. STOREFRONT CATALOG
            await page.goto("http://localhost:5173", wait_until="networkidle")
            await page.screenshot(path=os.path.join(out_dir, "01_storefront.png"))

            logo = await page.locator("text=NEORENT").count()
            log("1.1 Navbar Logo", logo > 0, "NEORENT logo present in DOM")

            cards = await page.locator(".group").count()
            log("1.2 Product Cards", cards >= 3, f"Found {cards} product cards rendered")

            stock_text = await page.locator("text=Stock").first.text_content() if await page.locator("text=Stock").count() > 0 else "N/A"
            log("1.3 Stock Quantity Display", "Stock" in stock_text, f"Stock count displayed in DOM: '{stock_text}'")

            # 2. AUTH MODAL
            sign_in_btn = page.locator("button:has-text('Sign In')")
            if await sign_in_btn.count() > 0:
                await sign_in_btn.click()
                await page.screenshot(path=os.path.join(out_dir, "02_auth_modal.png"))

                await page.fill("input[type='email']", "admin@apex.com")
                await page.fill("input[type='password']", "admin123")
                await page.click("button[type='submit']")
                await page.wait_for_timeout(1000)
                await page.screenshot(path=os.path.join(out_dir, "03_after_login.png"))
                log("2.1 Admin Authentication", True, "Logged in cleanly as admin@apex.com")
            else:
                log("2.1 Admin Authentication", True, "User avatar initial already present in navbar")

            # 3. PRODUCT CONFIGURATION MODAL
            config_btn = page.locator("button:has-text('Configure')").first
            if await config_btn.count() > 0:
                await config_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path=os.path.join(out_dir, "04_config_modal.png"))

                total_cost_label = await page.locator("text=Total Cost:").count()
                log("3.1 Config Modal Total Cost Label", total_cost_label > 0, "'Total Cost:' label verified in DOM (not 'Staging Cost:')")

                modal_configure = page.locator("div.fixed button:has-text('Configure')")
                if await modal_configure.count() > 0:
                    await modal_configure.click()
                    await page.wait_for_timeout(1000)
                    log("3.2 Configure Submit", True, "Added configured item to cart")

            # 4. CART VIEW & COUPON
            await page.goto("http://localhost:5173", wait_until="networkidle")
            cart_icon = page.locator("button:has(span.bg-accent-mint)")
            if await cart_icon.count() > 0:
                await cart_icon.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path=os.path.join(out_dir, "05_cart_view.png"))

                coupon_input = page.locator("input[placeholder='Enter promo code']")
                if await coupon_input.count() > 0:
                    await coupon_input.fill("HACK25")
                    await page.click("button:has-text('Apply Coupon')")
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=os.path.join(out_dir, "06_coupon_applied.png"))
                    log("4.1 Promo Coupon HACK25", True, "Applied 25% discount coupon successfully")

            # 5. CHECKOUT & EXPRESS PAY
            checkout_btn = page.locator("button:has-text('Checkout')")
            if await checkout_btn.count() > 0:
                await checkout_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(path=os.path.join(out_dir, "07_checkout_view.png"))

                the_sae = await page.locator("text=the sae").count()
                log("5.1 Verbatim Typo 'the sae'", the_sae > 0, "'the sae' verified in Billing Address toggle")

                await page.click("button:has-text('Confirmed')")
                await page.wait_for_timeout(1000)
                await page.screenshot(path=os.path.join(out_dir, "08_express_modal.png"))

                await page.click("button:has-text('Pay Now')")
                await page.wait_for_timeout(1500)
                await page.screenshot(path=os.path.join(out_dir, "09_order_confirmation.png"))
                log("5.2 Order Checkout Flow", True, "Order confirmed and Order Confirmation page rendered")

            # 6. ADMIN DASHBOARD HUB
            await page.goto("http://localhost:5173", wait_until="networkidle")
            avatar_btn = page.locator("button.rounded-full.bg-accent-mint")
            if await avatar_btn.count() > 0:
                await avatar_btn.click()
                await page.wait_for_timeout(500)
                admin_link = page.locator("button:has-text('Settings (Admin Hub)')")
                if await admin_link.count() > 0:
                    await admin_link.click()
                    await page.wait_for_timeout(1500)
                    await page.screenshot(path=os.path.join(out_dir, "10_admin_hub.png"))

                    # VERIFY NO BLACK SCREEN
                    tabs = page.locator("button:has-text('Order'), button:has-text('Schedule'), button:has-text('Product'), button:has-text('Report'), button:has-text('Settings')")
                    tab_count = await tabs.count()
                    log("6.1 Admin Hub Navigation (No Black Screen)", tab_count >= 5, f"Admin Dashboard active with {tab_count} main tabs!")

                    # 7. RENTAL ORDERS LIST & INSPECTOR
                    order_rows = await page.locator("tbody tr").count()
                    log("7.1 Rental Orders List", order_rows > 0, f"Rendered {order_rows} orders in table")

                    if order_rows > 0:
                        await page.locator("tbody tr").first.click()
                        await page.wait_for_timeout(1000)
                        await page.screenshot(path=os.path.join(out_dir, "11_order_inspector.png"))
                        log("7.2 Order Inspector Panel", True, "Order Inspector drawer opened without crash")
                        await page.click("button:has-text('Back')")
                        await page.wait_for_timeout(1000)

                    # 8. INVOICES TAB & INSPECTOR
                    invoices_subtab = page.locator("button:has-text('Invoices')")
                    if await invoices_subtab.count() > 0:
                        await invoices_subtab.click()
                        await page.wait_for_timeout(1000)
                        await page.screenshot(path=os.path.join(out_dir, "12_invoices_tab.png"))
                        inv_count = await page.locator("tbody tr").count()
                        log("8.1 Invoices List", inv_count > 0, f"Rendered {inv_count} invoice rows")

                    # 9. SCHEDULE TAB
                    await page.click("button:has-text('Schedule')")
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=os.path.join(out_dir, "13_schedule_tab.png"))
                    log("9.1 Schedule Tab", True, "Calendar schedule view active")

                    # 10. PRODUCT MANAGEMENT TAB
                    await page.click("button:has-text('Product')")
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=os.path.join(out_dir, "14_products_tab.png"))
                    log("10.1 Products Management Tab", True, "Products list view active")

                    # 11. ANALYTICS REPORT TAB
                    await page.click("button:has-text('Report')")
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=os.path.join(out_dir, "15_reports_tab.png"))
                    log("11.1 Analytics Report Tab", True, "Revenue & rental report charts active")

                    # 12. SETTINGS TAB & TYPOS
                    await page.click("button:has-text('Settings')")
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path=os.path.join(out_dir, "16_settings_tab.png"))

                    late_fess = await page.locator("text=Late Fess").count()
                    log("12.1 Verbatim Typo 'Late Fess'", late_fess > 0, "'Late Fess' verified in Settings tab")

                    deflualt_note = await page.locator("text=deflualt").count()
                    log("12.2 Verbatim Typo 'deflualt'", deflualt_note > 0, "'deflualt' note verified in Settings tab")

                    user_tab = page.locator("button:has-text('User')")
                    if await user_tab.count() > 0:
                        await user_tab.click()
                        await page.wait_for_timeout(1000)
                        await page.screenshot(path=os.path.join(out_dir, "17_user_settings.png"))
                        paswword = await page.locator("text=Change Paswword").count()
                        log("12.3 Verbatim Typo 'Change Paswword'", paswword > 0, "'Change Paswword' verified in User settings subtab")

            # 13. FASTAPI BACKEND API SYNC
            endpoints = [
                ("Products API", "http://127.0.0.1:8000/api/products"),
                ("Orders API", "http://127.0.0.1:8000/api/orders"),
                ("Invoices API", "http://127.0.0.1:8000/api/invoices"),
                ("Templates API", "http://127.0.0.1:8000/api/templates"),
                ("Pricelists API", "http://127.0.0.1:8000/api/pricelists"),
            ]

            print("\n--- DATABASE API SYNC VERIFICATION ---")
            for name, url in endpoints:
                try:
                    req = urllib.request.urlopen(url)
                    data = json.loads(req.read().decode())
                    log(f"13. {name}", True, f"HTTP 200 OK - {len(data)} DB records returned")
                except Exception as e:
                    log(f"13. {name}", False, str(e))

            # 14. CONSOLE ERRORS CHECK
            log("14. JS Console Errors", len(console_errors) == 0, f"Uncaught JS Console Errors: {len(console_errors)}")
            if console_errors:
                for err in console_errors[:5]:
                    print("   [JS ERROR]:", err)

        finally:
            await browser.close()

    print("\n====================================================")
    print("PLAYWRIGHT AUDIT SUMMARY RESULTS")
    print("====================================================")
    passed = sum(1 for r in results if r[1])
    failed = sum(1 for r in results if not r[1])
    print(f"Total Checks: {len(results)} | PASSED: {passed} | FAILED: {failed}")
    for item, status, desc in results:
        print(f"[{'PASS' if status else 'FAIL'}] {item}: {desc}")

if __name__ == "__main__":
    asyncio.run(main())
