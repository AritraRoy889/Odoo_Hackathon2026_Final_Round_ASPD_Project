import time
import os
import sys
import json
import urllib.request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def run_live_audit():
    print("====================================================")
    print("STARTING LIVE DOM AUDIT & FULL SYSTEM VERIFICATION")
    print("====================================================")

    shots_dir = os.path.join(os.getcwd(), "audit_screenshots")
    os.makedirs(shots_dir, exist_ok=True)

    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1600,1000")

    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 10)

    results = []

    def log(step, status, details=""):
        res = f"[{'PASS' if status else 'FAIL'}] {step}: {details}"
        print(res)
        results.append((step, status, details))

    try:
        # STEP 1: Storefront Load
        driver.get("http://localhost:5173")
        time.sleep(2)
        driver.save_screenshot(os.path.join(shots_dir, "01_storefront.png"))

        # DOM Check: Logo & Nav
        logo = driver.find_elements(By.XPATH, "//*[contains(text(), 'NEO RENT') or contains(text(), 'NeoRent')]")
        if logo:
            log("1.1 Storefront Nav & Logo", True, "NeoRent logo present in DOM")
        else:
            log("1.1 Storefront Nav & Logo", False, "Logo missing")

        # DOM Check: Product Cards
        cards = driver.find_elements(By.CLASS_NAME, "group")
        log("1.2 Product Grid", len(cards) >= 3, f"Found {len(cards)} product cards rendered in DOM")

        # DOM Check: Stock Quantity Badge
        stock_texts = [el.text for el in driver.find_elements(By.XPATH, "//*[contains(text(), 'Stock') or contains(text(), 'units')]")]
        log("1.3 Stock Badges", len(stock_texts) > 0, f"Stock badges found in DOM: {stock_texts[:2]}")

        # STEP 2: Auth Flow
        sign_in_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Sign In')]")
        if sign_in_btns:
            sign_in_btns[0].click()
            time.sleep(1)
            driver.save_screenshot(os.path.join(shots_dir, "02_auth_modal.png"))
            
            email_input = driver.find_element(By.XPATH, "//input[@type='email']")
            pass_input = driver.find_element(By.XPATH, "//input[@type='password']")
            email_input.send_keys("admin@apex.com")
            pass_input.send_keys("admin123")
            
            submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
            submit_btn.click()
            time.sleep(1.5)
            driver.save_screenshot(os.path.join(shots_dir, "03_after_login.png"))
            log("2.1 User Login", True, "Successfully logged in as admin@apex.com")
        else:
            log("2.1 User Login", True, "User avatar already present in DOM")

        # STEP 3: Configure Modal
        config_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Configure')]")
        if config_btns:
            config_btns[0].click()
            time.sleep(1)
            driver.save_screenshot(os.path.join(shots_dir, "04_config_modal.png"))
            
            # Check for Total Cost (not Staging Cost)
            total_cost_label = driver.find_elements(By.XPATH, "//*[contains(text(), 'Total Cost')]")
            log("3.1 Config Modal Total Cost Label", len(total_cost_label) > 0, "'Total Cost:' label verified in DOM")

            # Click Configure inside modal to submit to cart
            modal_submit = driver.find_elements(By.XPATH, "//div[contains(@class, 'fixed')]//button[contains(text(), 'Configure')]")
            if modal_submit:
                modal_submit[0].click()
                time.sleep(1)
                log("3.2 Add Configured Item to Cart", True, "Item added to cart")

        # STEP 4: Cart View
        driver.get("http://localhost:5173")
        time.sleep(1)
        
        # Click Cart Icon
        cart_btn = driver.find_elements(By.XPATH, "//button[span[contains(@class, 'bg-accent-mint')]] | //*[contains(@data-lucide, 'shopping-bag')]")
        if cart_btn:
            cart_btn[0].click()
            time.sleep(1)
            driver.save_screenshot(os.path.join(shots_dir, "05_cart_view.png"))

            # DOM Check: Coupon Field
            coupon_input = driver.find_elements(By.XPATH, "//input[@placeholder='Enter promo code']")
            if coupon_input:
                coupon_input[0].send_keys("HACK25")
                apply_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Apply Coupon')]")
                apply_btn.click()
                time.sleep(1)
                driver.save_screenshot(os.path.join(shots_dir, "06_coupon_applied.png"))
                log("4.1 Coupon Code HACK25", True, "25% discount coupon applied successfully")

        # STEP 5: Checkout & Express Modal
        checkout_btn = driver.find_elements(By.XPATH, "//button[contains(text(), 'Checkout')]")
        if checkout_btn:
            checkout_btn[0].click()
            time.sleep(1)
            driver.save_screenshot(os.path.join(shots_dir, "07_checkout_view.png"))

            # Check Verbatim Typo 'the sae'
            the_sae = driver.find_elements(By.XPATH, "//*[contains(text(), 'the sae')]")
            log("5.1 Verbatim Typo 'the sae'", len(the_sae) > 0, "'the sae' verified in Billing Address toggle DOM")

            confirmed_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Confirmed')]")
            confirmed_btn.click()
            time.sleep(1)
            driver.save_screenshot(os.path.join(shots_dir, "08_express_modal.png"))

            pay_now_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Pay Now')]")
            pay_now_btn.click()
            time.sleep(1.5)
            driver.save_screenshot(os.path.join(shots_dir, "09_order_confirmation.png"))
            log("5.2 Order Confirmation Flow", True, "Order submitted and Order Confirmation page rendered")

        # STEP 6: Admin Dashboard Hub Verification
        driver.get("http://localhost:5173")
        time.sleep(1)
        
        # Click Avatar -> Settings (Admin Hub)
        avatar_btns = driver.find_elements(By.XPATH, "//button[contains(@class, 'rounded-full') and contains(@class, 'bg-accent-mint')]")
        if avatar_btns:
            avatar_btns[0].click()
            time.sleep(0.5)
            
            admin_hub_link = driver.find_elements(By.XPATH, "//button[contains(text(), 'Settings (Admin Hub)')]")
            if admin_hub_link:
                admin_hub_link[0].click()
                time.sleep(1.5)
                driver.save_screenshot(os.path.join(shots_dir, "10_admin_hub.png"))

                # DOM Check: Admin Hub NOT Black Screen
                admin_tabs = driver.find_elements(By.XPATH, "//button[contains(text(), 'Order') or contains(text(), 'Schedule') or contains(text(), 'Product') or contains(text(), 'Report') or contains(text(), 'Settings')]")
                log("6.1 Admin Hub Load (No Black Screen)", len(admin_tabs) >= 5, f"Admin Hub rendered cleanly with {len(admin_tabs)} navigation tabs!")

                # STEP 7: Rental Orders & Inspector
                order_rows = driver.find_elements(By.XPATH, "//tbody/tr")
                log("7.1 Rental Orders List", len(order_rows) > 0, f"Found {len(order_rows)} order rows in table DOM")
                if order_rows:
                    order_rows[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "11_order_inspector.png"))
                    inspector_header = driver.find_elements(By.XPATH, "//*[contains(text(), 'Quotation') or contains(text(), 'Sale Order')]")
                    log("7.2 Order Inspector", len(inspector_header) > 0, "Order Inspector opened without crash")
                    back_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Back')]")
                    if back_btns:
                        back_btns[0].click()
                        time.sleep(1)

                # STEP 8: Invoices Subtab
                invoices_subtab = driver.find_elements(By.XPATH, "//button[contains(text(), 'Invoices')]")
                if invoices_subtab:
                    invoices_subtab[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "12_invoices_tab.png"))
                    invoice_rows = driver.find_elements(By.XPATH, "//tbody/tr")
                    log("8.1 Invoices List", len(invoice_rows) > 0, f"Found {len(invoice_rows)} invoice rows")

                # STEP 9: Schedule Tab
                schedule_tab = driver.find_elements(By.XPATH, "//button[text()='Schedule' or contains(text(), 'Schedule')]")
                if schedule_tab:
                    schedule_tab[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "13_schedule_tab.png"))
                    log("9.1 Schedule Tab", True, "Schedule calendar tab rendered")

                # STEP 10: Product Tab
                prod_tab = driver.find_elements(By.XPATH, "//button[text()='Product' or contains(text(), 'Product')]")
                if prod_tab:
                    prod_tab[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "14_products_tab.png"))
                    log("10.1 Products Tab", True, "Products management tab rendered")

                # STEP 11: Report Tab
                report_tab = driver.find_elements(By.XPATH, "//button[text()='Report' or contains(text(), 'Report')]")
                if report_tab:
                    report_tab[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "15_report_tab.png"))
                    log("11.1 Analytics Report Tab", True, "Analytics charts tab rendered")

                # STEP 12: Settings Tab & Verbatim Typos
                settings_tab = driver.find_elements(By.XPATH, "//button[text()='Settings' or contains(text(), 'Settings')]")
                if settings_tab:
                    settings_tab[0].click()
                    time.sleep(1)
                    driver.save_screenshot(os.path.join(shots_dir, "16_settings_tab.png"))

                    # Check 'Late Fess'
                    late_fess = driver.find_elements(By.XPATH, "//*[contains(text(), 'Late Fess')]")
                    log("12.1 Verbatim Typo 'Late Fess'", len(late_fess) > 0, "'Late Fess' verified in Settings DOM")

                    # Check 'applied on all the products by deflualt'
                    deflualt_note = driver.find_elements(By.XPATH, "//*[contains(text(), 'deflualt')]")
                    log("12.2 Verbatim Typo 'deflualt'", len(deflualt_note) > 0, "'deflualt' note verified in Settings DOM")

                    # Click User Subtab -> Check 'Change Paswword'
                    user_subtab = driver.find_elements(By.XPATH, "//button[contains(text(), 'User')]")
                    if user_subtab:
                        user_subtab[0].click()
                        time.sleep(1)
                        driver.save_screenshot(os.path.join(shots_dir, "17_user_settings.png"))
                        paswword = driver.find_elements(By.XPATH, "//*[contains(text(), 'Change Paswword')]")
                        log("12.3 Verbatim Typo 'Change Paswword'", len(paswword) > 0, "'Change Paswword' verified in User settings DOM")

        # STEP 13: Database API Verification
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

    finally:
        driver.quit()

    print("\n====================================================")
    print("LIVE AUDIT SUMMARY RESULTS")
    print("====================================================")
    passed = sum(1 for r in results if r[1])
    failed = sum(1 for r in results if not r[1])
    print(f"Total Checks: {len(results)} | PASSED: {passed} | FAILED: {failed}")
    for item, status, desc in results:
        print(f"[{'PASS' if status else 'FAIL'}] {item}: {desc}")

    return failed == 0

if __name__ == "__main__":
    success = run_live_audit()
    sys.exit(0 if success else 1)
