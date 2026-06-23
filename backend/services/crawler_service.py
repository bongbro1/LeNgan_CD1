import asyncio
import re
import sys

# Fix Windows console encoding for Vietnamese text
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from playwright.async_api import async_playwright

class CrawlerService:
    @staticmethod
    def extract_tiki_id(url):
        match_id = re.search(r"-p(\d+)\.html", url)
        match_spid = re.search(r"spid=(\d+)", url)
        product_id = match_id.group(1) if match_id else None
        spid = match_spid.group(1) if match_spid else product_id
        return product_id, spid

    @staticmethod
    async def crawl_tiki(url, max_reviews=200):
        print("DEBUG: --- CRAWL TIKI ---")
        reviews = []
        error_msg = None
        async with async_playwright() as p:
            browser = await p.chromium.launch(channel="msedge", headless=True)
            context = await browser.new_context(viewport={'width': 1366, 'height': 800})
            page = await context.new_page()

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Cuộn trang từ từ xuống để trigger lazy load
                for i in range(10):
                    await page.mouse.wheel(0, 1000)
                    await asyncio.sleep(1)
                    
                    # Kiểm tra xem review đã hiện ra chưa
                    try:
                        if await page.query_selector(".review-comment"):
                            break
                    except:
                        pass
                
                page_count = 1
                while True:
                    try:
                        await page.wait_for_selector(".review-comment", timeout=10000)
                    except:
                        if page_count == 1: error_msg = "Không tìm thấy đánh giá nào trên Tiki."
                        break

                    items = await page.query_selector_all(".review-comment")
                    for item in items:
                        content_el = await item.query_selector(".review-comment__content")
                        if not content_el: continue
                        content = (await content_el.inner_text()).strip()
                        if not content or any(r['content'] == content for r in reviews): continue
                        author_el = await item.query_selector(".review-comment__user-name")
                        author = await author_el.inner_text() if author_el else "User"
                        reviews.append({
                            "id": f"tiki-{len(reviews)}", "content": content, "rating": 5,
                            "author": author.strip(), "date": "Gần đây", "platform": "Tiki",
                            "sentiment": "neutral", "confidence": 0.0
                        })

                    if len(reviews) >= max_reviews: break
                    next_button = await page.query_selector("a.btn.next")
                    if next_button and await next_button.is_visible():
                        await next_button.click()
                        await asyncio.sleep(2)
                        page_count += 1
                    else: break
            except Exception as e:
                error_msg = f"Lỗi Tiki: {str(e)}"
            finally:
                await browser.close()
            return reviews, error_msg

    @staticmethod
    async def crawl_lazada(url, max_reviews=200):
        print("DEBUG: --- CRAWL LAZADA ---")
        reviews = []
        error_msg = None
        async with async_playwright() as p:
            browser = await p.chromium.launch(channel="msedge", headless=True)
            context = await browser.new_context(
                viewport={'width': 1366, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh"
            )
            page = await context.new_page()
            # Script siêu ngụy trang (Advanced Stealth)
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                const getParameter = HTMLCanvasElement.prototype.getContext;
                HTMLCanvasElement.prototype.getContext = function(type) {
                    const context = getParameter.apply(this, arguments);
                    if (type === 'webgl' || type === 'experimental-webgl') {
                        const originalGetParameter = context.getParameter;
                        context.getParameter = function(param) {
                            if (param === 37445) return 'Intel Inc.';
                            if (param === 37446) return 'Intel(R) Iris(TM) Graphics 6100';
                            return originalGetParameter.apply(this, arguments);
                        };
                    }
                    return context;
                };
                window.chrome = { runtime: {} };
            """)

            try:
                # Thử vào trang chủ trước
                try:
                    await page.goto("https://www.lazada.vn/", wait_until="networkidle", timeout=30000)
                    await asyncio.sleep(2)
                except: pass

                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Cuộn trang từ từ như người thật
                for i in range(4):
                    await page.mouse.wheel(0, 700 + (i * 100))
                    await asyncio.sleep(1.5)

                page_count = 1
                while True:
                    content_html = await page.content()
                    if "punish" in page.url or "baxia-dialog" in content_html:
                        error_msg = "Lazada đã chặn truy cập (Captcha). Hãy thử lại sau hoặc dùng link khác."
                        break

                    try:
                        await page.wait_for_selector(".mod-reviews .item", timeout=10000)
                    except:
                        if page_count == 1: error_msg = "Không tìm thấy bình luận trên Lazada."
                        break

                    items = await page.query_selector_all(".mod-reviews .item")
                    for item in items:
                        content_el = await item.query_selector(".item-content-main-content-reviews-item span")
                        if not content_el: continue
                        content = (await content_el.inner_text()).strip()
                        if not content or any(r['content'] == content for r in reviews): continue
                        author_el = await item.query_selector(".reviewer")
                        author = await author_el.inner_text() if author_el else "User"
                        reviews.append({
                            "id": f"laz-{len(reviews)}", "content": content, "rating": 5,
                            "author": author.strip(), "date": "Gần đây", "platform": "Lazada",
                            "sentiment": "neutral", "confidence": 0.0
                        })
                    
                    if len(reviews) >= max_reviews: break
                    pagination_buttons = await page.query_selector_all("button.iweb-pagination-item-link")
                    if not pagination_buttons: break
                    next_button = pagination_buttons[-1]
                    if await next_button.get_attribute("disabled") is not None: break
                    await next_button.click()
                    await asyncio.sleep(3)
                    page_count += 1
            except Exception as e:
                error_msg = f"Lỗi Lazada: {str(e)}"
            finally:
                await browser.close()
            return reviews, error_msg

    @staticmethod
    async def crawl_shopee(url, max_reviews=200):
        print("DEBUG: --- CRAWL SHOPEE ---")
        reviews = []
        error_msg = None
        async with async_playwright() as p:
            browser = await p.chromium.launch(channel="msedge", headless=True)
            context = await browser.new_context(
                viewport={'width': 1366, 'height': 800},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                locale="vi-VN", timezone_id="Asia/Ho_Chi_Minh"
            )
            page = await context.new_page()
            # Script siêu ngụy trang cho Shopee
            await page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                window.chrome = { runtime: {} };
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
                );
            """)

            try:
                # Bước 1: Ghé thăm trang chủ Shopee
                await page.goto("https://shopee.vn/", wait_until="networkidle", timeout=60000)
                await asyncio.sleep(2)
                
                # Bước 2: Vào trang sản phẩm
                await page.goto(url, wait_until="domcontentloaded", timeout=90000)
                
                # Cuộn trang ngẫu nhiên
                for i in range(1, 8):
                    await page.mouse.wheel(0, 600 + (i * 50))
                    await asyncio.sleep(1.2)
                
                page_count = 1
                while True:
                    content_html = await page.content()
                    if "Mã xác minh" in content_html or "robot" in content_html:
                        error_msg = "Shopee đã chặn truy cập (Captcha). Vui lòng thử lại sau."
                        break

                    try:
                        await page.wait_for_selector(".shopee-product-comment-list", timeout=15000)
                    except:
                        if page_count == 1: error_msg = "Không tìm thấy bình luận trên Shopee."
                        break

                    items = await page.query_selector_all(".shopee-product-comment-list .q2b7Oq")
                    if not items: break
                    for item in items:
                        content_el = await item.query_selector(".YNedDV")
                        if not content_el: continue
                        content = (await content_el.inner_text()).strip()
                        if not content or any(r['content'] == content for r in reviews): continue
                        author_el = await item.query_selector(".InK5kS")
                        author = await author_el.inner_text() if author_el else "User"
                        reviews.append({
                            "id": f"shopee-{len(reviews)}", "content": content, "rating": 5,
                            "author": author.strip(), "date": "Gần đây", "platform": "Shopee",
                            "sentiment": "neutral", "confidence": 0.0
                        })
                    if len(reviews) >= max_reviews: break
                    next_button = await page.query_selector("button.shopee-icon-button--right")
                    if next_button:
                        if await next_button.get_attribute("disabled") is not None: break
                        await next_button.click()
                        await asyncio.sleep(4)
                        page_count += 1
                    else: break
            except Exception as e:
                error_msg = f"Lỗi Shopee: {str(e)}"
            finally:
                await browser.close()
            return reviews, error_msg

    @classmethod
    async def analyze_url(cls, url, platform='auto'):
        results = {"name": "Sản phẩm", "reviews": [], "error": None}

        # Bước 1: Mở browser riêng để lấy tên sản phẩm, rồi đóng ngay
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(channel="msedge", headless=True)
                context = await browser.new_context(
                    viewport={'width': 1366, 'height': 800},
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                )
                page = await context.new_page()
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                    page_title = await page.title()
                    results["name"] = page_title.split('|')[0].strip()
                except Exception as e:
                    print(f"Could not get product name: {e}")
                finally:
                    await browser.close()
        except Exception as e:
            print(f"Error getting product name: {e}")

        # Bước 2: Gọi crawler tương ứng (mỗi crawler tự mở/đóng browser riêng)
        try:
            if 'tiki.vn' in url or platform == 'tiki':
                results["reviews"], results["error"] = await cls.crawl_tiki(url)
            elif 'lazada.vn' in url or platform == 'lazada':
                results["reviews"], results["error"] = await cls.crawl_lazada(url)
            elif 'shopee.vn' in url or platform == 'shopee':
                results["reviews"], results["error"] = await cls.crawl_shopee(url)
            else:
                results["error"] = "Không nhận diện được nền tảng. Hỗ trợ: Tiki, Lazada, Shopee."
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            results["error"] = f"Lỗi crawl: {str(e)}\n\nTraceback: {tb}"

        return results
