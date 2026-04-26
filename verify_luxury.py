from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to Luxury Store...")
        try:
            page.goto("http://localhost:5173/luxury", timeout=5000)
            page.wait_for_timeout(2000)
            page.screenshot(path="verification_luxury.png", full_page=True)
            print("Luxury Store screenshot saved.")
        except Exception as e:
            print(f"Navigation failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()
