from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home...")
        try:
            page.goto("http://localhost:5173", timeout=30000)
            page.wait_for_load_state("networkidle")
        except Exception as e:
            print(f"Navigation failed: {e}")
            browser.close()
            return

        print("Checking for Ticker...")
        # Check for "LIVE" text in ticker
        try:
            ticker = page.locator("text=LIVE")
            ticker.wait_for(state="visible", timeout=5000)
            print("Ticker found.")
        except:
            print("Ticker NOT found.")

        print("Checking Navigation...")
        # Check for "Exchange" link
        try:
            exchange_link = page.get_by_role("link", name="Exchange").first
            exchange_link.wait_for(state="visible")
            print("Exchange link found.")
        except:
            print("Exchange link NOT found.")

        # Check for "Futures" link
        try:
            futures_link = page.get_by_role("link", name="Futures").first
            futures_link.wait_for(state="visible")
            print("Futures link found.")
        except:
            print("Futures link NOT found.")

        print("Taking screenshot...")
        page.screenshot(path="verification_frontend.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
