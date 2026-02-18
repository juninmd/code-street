from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173/admin/wealth")
        try:
            page.wait_for_selector("text=TRIGGER CRASH", timeout=5000)
        except:
            pass
        page.screenshot(path="verification_admin.png")
        browser.close()

if __name__ == "__main__":
    run()
