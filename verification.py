from playwright.sync_api import sync_playwright
import time

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        try:
            # Go to Homepage
            print("Navigating to Homepage...")
            page.goto("http://localhost:5173", timeout=60000)
            page.wait_for_selector("text=CodeStreet", timeout=60000)
            print("Homepage loaded. Waiting for ticker...")
            time.sleep(5) # Wait for ticker and potential market alert
            page.screenshot(path="verification_home.png")
            print("Home screenshot saved to verification_home.png")

            # Go to Admin Wealth
            print("Navigating to Admin Wealth...")
            page.goto("http://localhost:5173/admin/wealth", timeout=60000)
            page.wait_for_selector("text=Executive Dashboard", timeout=60000)
            print("Admin Dashboard loaded.")
            time.sleep(2)
            page.screenshot(path="verification_admin.png")
            print("Admin screenshot saved to verification_admin.png")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
