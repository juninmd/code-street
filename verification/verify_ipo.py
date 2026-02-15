from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    # Go to the app
    page.goto("http://localhost:5173")

    # Wait for the page to load (look for "Market Overview")
    page.wait_for_selector("text=Market Overview")

    # Click the "File IPO (S-1)" button
    # Using get_by_role 'button' with name
    page.get_by_role("button", name="File IPO (S-1)").click()

    # Wait for the modal content
    page.wait_for_selector("text=SEC Form 424B4")

    # Take screenshot of the modal
    page.screenshot(path="verification/ipo_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
