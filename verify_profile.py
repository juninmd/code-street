from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Profile...")
        try:
            # Set high net worth to see black card
            page.goto("http://localhost:5173", timeout=5000)
            page.evaluate("""() => {
                localStorage.setItem('cash_balance', '15000000.00');
            }""")

            page.goto("http://localhost:5173/profile", timeout=5000)
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_profile.png", full_page=True)
            print("Profile screenshot saved.")
        except Exception as e:
            print(f"Navigation failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()
