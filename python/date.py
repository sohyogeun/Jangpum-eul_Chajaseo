import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import pprint
import json, re

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pymongo import MongoClient

# --- .env 파일 로드 ---
import os
import sys
from dotenv import load_dotenv
load_dotenv()
# --- 로드 끝 ---


# 2. 봇 탐지 우회 Chrome 옵션 설정
options = webdriver.ChromeOptions()
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("--disable-blink-features=AutomationControlled")

PRICE_SELECTORS = [
    ".price_area .price-2 strong",
    ".price_area .price-1 strong",
    ".price_area strong",
    ".prd_price .price .num",
    ".prd_price .sale .num",
    ".prd_price .price",
    ".total_price .price .num",
    ".price .num",
    ".price",
]

def _extract_digits(txt: str) -> str:
    m = re.search(r"(\d[\d,]*)", txt or "")
    return m.group(1).replace(",", "") if m else ""

def get_price_from_jsonld(driver) -> str:
    try:
        soup = BeautifulSoup(driver.page_source, "html.parser")
        for tag in soup.select("script[type='application/ld+json']"):
            try:
                data = json.loads(tag.string or "{}")
            except Exception:
                continue
            candidates = data if isinstance(data, list) else [data]
            for obj in candidates:
                offers = obj.get("offers")
                if isinstance(offers, dict):
                    price = offers.get("price") or offers.get("lowPrice") or offers.get("highPrice")
                    if price and _extract_digits(str(price)):
                        return _extract_digits(str(price))
                elif isinstance(offers, list):
                    for off in offers:
                        price = off.get("price") or off.get("lowPrice") or off.get("highPrice")
                        if price and _extract_digits(str(price)):
                            return _extract_digits(str(price))
    except Exception:
        pass
    return ""

def get_price_from_dom(driver, timeout=12) -> str:
    wait = WebDriverWait(driver, timeout)
    for css in PRICE_SELECTORS:
        try:
            el = wait.until(lambda d: (
                (elem := d.find_element(By.CSS_SELECTOR, css)) and
                re.search(r"\d", (elem.get_attribute("textContent") or ""))
            ) and elem)
            txt = el.get_attribute("textContent") or ""
            price = _extract_digits(txt)
            if price:
                return price
        except Exception:
            continue
    return ""

def get_price_from_pagesource_regex(driver) -> str:
    src = driver.page_source
    # 자주 쓰이는 키들 추가
    keys = ("salePrice", "finalPrice", "price", "lowPrice", "dcPrice", "goodsPrice", "prc", "sellPrc")
    for key in keys:
        m = re.search(rf'"{key}"\s*:\s*"?(?P<p>\d[\d,]*)"?', src)
        if m and _extract_digits(m.group("p")):
            return _extract_digits(m.group("p"))
    # HTML 텍스트에서 숫자 패턴 직접 탐색(원/콤마 포함)
    m2 = re.search(r'(?:판매가|할인가|쿠폰가|최종가|가격)[^\d]{0,20}(\d[\d,]{2,})', src)
    if m2 and _extract_digits(m2.group(1)):
        return _extract_digits(m2.group(1))
    return ""

def robust_get_price(driver) -> str:
    price = get_price_from_jsonld(driver)
    if price:
        return price
    price = get_price_from_dom(driver)
    if price:
        return price
    price = get_price_from_pagesource_regex(driver)
    return price or "정보 없음"

# 3. Chrome 드라이버 설정
service = Service(ChromeDriverManager().install()) 
driver = webdriver.Chrome(service=service, options=options)

# 4. (추가) 페이지 접속 및 HTML 가져오기
url = "https://www.oliveyoung.co.kr/store/main/getBestList.do"
print("브라우저를 실행하고 페이지로 이동합니다...")
driver.get(url)

html = None  # html 변수를 미리 None으로 선언

#
# ⬇️⬇️ (필수) 랭킹 페이지 로딩을 위한 'try...except' 블록 ⬇️⬇️
#
try:
    print("보안 체크 통과 및 상품 목록 로딩 대기 중... (최대 15초)")
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a.prd_thumb")))
    print("상품 목록 로딩 완료.")
    
    html = driver.page_source  # 성공 시 html 변수에 페이지 소스 저장

except Exception as e:
    print(f"오류: 15초 내에 상품 목록을 찾지 못했습니다. (보안에 막혔을 수 있습니다)")
    print(f"에러 상세: {e}")
    # 랭킹 페이지 로딩 실패 시, 브라우저를 끄고 스크립트를 즉시 종료
    driver.quit() 
    sys.exit() # sys.exit()를 사용하려면 맨 위에 'import sys'가 있어야 함
#
# ⬆️⬆️ 'try...except' 블록 끝 ⬆️⬆️
#

# 6. BeautifulSoup으로 파싱
if html: # html이 None이 아닐 때 (즉, try가 성공했을 때)만 파싱
    soup = BeautifulSoup(html, 'html.parser')
    items = soup.select('a.prd_thumb')
else:
    print("HTML을 가져오지 못해 파싱을 건너뜁니다.")
    items = [] # 실패 시 items를 빈 리스트로 만듦

product_list = []  # product_list 정의
print(f"총 {len(items)}개의 상품을 찾았습니다.\n")

# 7. (수정) 순회하며 *상세 페이지* 정보까지 추출
for item in items:
    # 7-1. 랭킹 페이지에서 기본 정보 수집
    img_tag = item.select_one('img')
    if not img_tag:
        continue
        
    name = img_tag.get('alt')
    product_no = item.get('data-ref-goodsno')
    ranking_tag = item.select_one('span.thumb_flag')
    ranking = ranking_tag.text.strip() if ranking_tag else 'N/A'
    image_url = img_tag.get('src')
    
    # 7-2. 상세 페이지 URL 가져오기
    product_url = item.get('href')

    # ⬇️ (수정) if 블록은 URL '수정'만 담당
    if product_url and product_url.startswith('/'):
        product_url = 'https://www.oliveyoung.co.kr' + product_url
    
    # ⬇️ (수정) 상세 페이지 접속 로직은 'if' 블록 밖으로 이동
    # 7-3. 상세 페이지로 이동
    try:
        driver.get(product_url)
        driver.set_window_size(1280, 900)
        driver.execute_script("window.scrollBy(0, 200)")
    except Exception as e:
        print(f"  [오류] {name} 상품의 상세 페이지({product_url}) 접속 실패: {e}")
        continue # 이 상품은 건너뛰고 다음 루프로

    # ⬇️ (수정) 상세 정보 크롤링 로직도 'if' 블록 밖으로 이동
    # 7-4. (★수정★) 상세 페이지에서 "브랜드", "가격", "성분" 데이터 크롤링
    try:
        # (브랜드)
        try:
            brand_element = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((
                    By.CSS_SELECTOR,
                    ".prd_brand_name a, .prd_brand a, .brand-name, .brand > a"
                ))
            )
            brand = brand_element.text.strip()
        except Exception:
            brand = "정보 없음"

        # (가격)
        try:
            price = robust_get_price(driver)
        except Exception:
            price = "정보 없음"

        # (성분)
        try:
            ingredient_tab = driver.find_elements(By.CSS_SELECTOR, "a[href='#artc_ingredient'], a[aria-controls='artc_ingredient']")
            if ingredient_tab:
                driver.execute_script("arguments[0].click();", ingredient_tab[0])
                ingredients_element = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "div.ingre_comp, .prd_info_detail"))
                )
                ingredients = ingredients_element.text.strip()
            else:
                ingredients = "정보 없음"
        except Exception:
            ingredients = "정보 없음"

        print(f"  [성공] {brand} - {name} (가격: {price})")

    except Exception as e:
        print(f"  [오류] {name} 상품의 상세 정보 로딩 실패. (CSS 선택자 확인 필요)")
        brand = "정보 없음"
        ingredients = "정보 없음"
        price = "정보 없음"

    # ⬇️ (수정) 'product_list.append'도 'if' 블록 밖으로 이동
    # 7-5. (수정) 모든 데이터를 합쳐서 리스트에 추가
    product_list.append({
        'ranking': ranking,
        'name': name,
        'brand': brand,             # ⬅️ 브랜드 추가
        'product_no': product_no,
        'product_url': product_url,
        'image_url': image_url,
        'ingredients': ingredients, # ⬅️ 상세 데이터 추가
        'price': price              # ⬅️ 상세 데이터 추가
    })
    
    # ⬇️ (수정) 'time.sleep'도 'if' 블록 밖으로 이동
    time.sleep(1.5) # 각 상품마다 1.5초 대기

# 8. (추가) 모든 for 루프가 끝나면 브라우저 닫기
print("\n모든 상세 정보 수집 완료. 브라우저를 종료합니다.")
driver.quit()

# 9. MongoDB Atlas에 저장
# -----------------------------------------------------------------
MONGO_URL = os.getenv('MONGO_URL')

if not MONGO_URL:
    print('❌ MONGO_URL이 주입되지 않았습니다. .env 파일을 확인하세요.')
    sys.exit(1) # 프로그램 종료

client = None # client 변수 선언
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    client.server_info() # 연결 테스트
    print("\n--- MongoDB Atlas 연결 성공 ---")

    db = client['oliveyoung_db']    # DB 이름
    collection = db['products']     # 컬렉션 이름

    if product_list: # product_list가 비어있지 않으면
        print(f"총 {len(product_list)}개 상품 확인. DB에 업데이트/삽입합니다...")
        update_count = 0
        insert_count = 0

        for item in product_list:
            filter = { 'product_no': item['product_no'] }
            update = { '$set': item }
            result = collection.update_one(filter, update, upsert=True)
            
            if result.matched_count > 0:
                update_count += 1
            elif result.upserted_id:
                insert_count += 1
                
        print(f"작업 완료: {insert_count}개 신규 삽입, {update_count}개 기존 업데이트.")
        
    else: # product_list가 비어있으면 (파싱 실패 또는 상품 0개)
        print("저장할 새 상품 데이터가 없습니다.")

except Exception as e:
    print("\n--- !! MongoDB 연결 또는 저장 오류 !! ---")
    print(f"오류: {e}")
    if "Invalid URI" in str(e) or "Authentication failed" in str(e):
         print("오류 원인: .env 파일의 MONGO_URL 값이 잘못되었습니다. Atlas 연결 문자열을 다시 확인하세요.")

finally:
    if client: # client가 성공적으로 연결되었었다면
        client.close()
        print("MongoDB 연결을 닫았습니다.")