from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Verify Admin Wealth
        try:
            print("Navigating to Admin Wealth...")
            page.goto("http://localhost:5173/admin/wealth")
            page.wait_for_selector("text=Executive Dashboard", timeout=10000)

            # Wait for data to load
            time.sleep(2)
            page.screenshot(path="verification_admin_initial.png")
            print("Initial Admin screenshot taken.")

            # Try to click Payout if available
            payout_btn = page.get_by_role("button", name="Payout to Bank")
            if payout_btn.is_visible() and not payout_btn.is_disabled():
                payout_btn.click()
                print("Clicked Payout button.")
                time.sleep(0.5) # Wait for confetti
                page.screenshot(path="verification_admin_payout.png")
                print("Payout screenshot taken.")
            else:
                print("Payout button disabled or not found.")

        except Exception as e:
            print(f"Admin verification failed: {e}")

        # 2. Verify IPO Filing
        try:
            print("Navigating to Board...")
            page.goto("http://localhost:5173/")
            page.wait_for_selector("text=Market Overview", timeout=10000)

            # Click File IPO
            page.get_by_role("button", name="File IPO (S-1)").click()
            time.sleep(0.5)

            # Fill form
            page.fill("input[placeholder='e.g. CodeStreet']", "My Surprise Feature")
            page.fill("textarea[placeholder='Definition of Done...']", "This is a test feature for confetti.")
            page.fill("input[type='datetime-local']", "2025-12-31T23:59")

            # Submit
            page.get_by_role("button", name="List on Exchange").click()
            print("Submitted IPO.")

            time.sleep(1) # Wait for confetti and modal close
            page.screenshot(path="verification_ipo_confetti.png")
            print("IPO screenshot taken.")

        except Exception as e:
            print(f"IPO verification failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()
