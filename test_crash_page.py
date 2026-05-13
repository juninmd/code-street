import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to Crash page...")
        await page.goto('http://localhost:5173/crash')
        await page.wait_for_selector('text=Startup Valuation Crash')
        print("Crash page loaded successfully!")

        await page.screenshot(path='crash_page.png')
        await browser.close()

asyncio.run(run())
