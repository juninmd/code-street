from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # 1. Check Board / Ticker
        print("Navigating to Home...")
        try:
            page.goto("http://localhost:5173")
            page.wait_for_timeout(3000) # Wait for ticker to fetch
            page.screenshot(path="verification_ticker.png")
            print("Ticker screenshot saved.")
        except Exception as e:
            print(f"Error checking Home: {e}")

        # 2. Check Portfolio
        print("Navigating to Portfolio...")
        try:
            page.goto("http://localhost:5173/portfolio")
            page.wait_for_timeout(1000)
            # We need to simulate having equity to see the button enabled, or just see the button state
            # I'll inject some local storage to make it interesting
            page.evaluate("""() => {
                localStorage.setItem('my_portfolio', JSON.stringify([{id: 1, shares: 100, avgPrice: 1.0}]));
                localStorage.setItem('cash_balance', '500.00');
                localStorage.setItem('last_claim_ts', '0'); // Eligible
            }""")
            page.reload()
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_portfolio.png")
            print("Portfolio screenshot saved.")
        except Exception as e:
            print(f"Error checking Portfolio: {e}")

        # 3. Check Admin Wealth
        print("Navigating to Admin Wealth...")
        try:
            page.goto("http://localhost:5173/admin/wealth")
            page.wait_for_timeout(2000)
            # Trigger the bot manually to see if it works (we can't easily capture the floating text in a static shot but we can try)
            # Using specific locator for the button
            page.get_by_role("button", name="Start Auto-Bot").click()
            page.wait_for_timeout(3500) # Wait for a trade
            page.screenshot(path="verification_admin.png")
            print("Admin screenshot saved.")
        except Exception as e:
            print(f"Error checking Admin: {e}")

        browser.close()

if __name__ == "__main__":
    run()
