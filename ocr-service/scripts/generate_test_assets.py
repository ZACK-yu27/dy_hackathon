from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "tests" / "assets"
ASSET_DIR.mkdir(parents=True, exist_ok=True)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def register_reportlab_font() -> str:
    candidates = [
        r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            pdfmetrics.registerFont(TTFont("OCRTestFont", str(path)))
            return "OCRTestFont"
    return "Helvetica"


def create_simple_image() -> Path:
    image = Image.new("RGB", (1800, 1200), "white")
    draw = ImageDraw.Draw(image)
    title_font = load_font(52)
    body_font = load_font(38)

    rows = [
        "OCR Printed Text Sample / 常规印刷体测试",
        "城市 City: 上海 Shanghai",
        "景点 Spot: 外滩 The Bund",
        "交通 Route: Metro Line 2 to East Nanjing Road",
        "住宿 Hotel: People Square Business Hotel",
        "饮食 Dining: Crab Soup Dumpling",
        "预算 Budget: RMB 120 per person",
        "提醒 Reminder: Avoid weekend crowd",
        "语言 Language: 中文 English",
    ]

    draw.text((100, 80), rows[0], font=title_font, fill="black")
    y = 200
    for row in rows[1:]:
        draw.text((100, y), row, font=body_font, fill="black")
        y += 105

    output = ASSET_DIR / "printed_text.png"
    image.save(output)
    return output


def create_complex_image() -> Path:
    image = Image.new("RGB", (1600, 1200), "white")
    draw = ImageDraw.Draw(image)
    title_font = load_font(44)
    body_font = load_font(30)
    small_font = load_font(24)

    draw.text((80, 70), "OCR Mixed Layout Test", font=title_font, fill="black")
    draw.text((80, 150), "旅游攻略识别样例 / Travel Plan Sample", font=body_font, fill="black")
    draw.text((80, 260), "景点 Spot: 外滩 The Bund", font=body_font, fill="black")
    draw.text((80, 320), "交通 Route: Metro Line 2 -> East Nanjing Road", font=body_font, fill="black")
    draw.text((80, 380), "住宿 Hotel: People Square Business Hotel", font=body_font, fill="black")
    draw.text((80, 440), "饮食 Dining: 生煎 + crab soup dumpling", font=body_font, fill="black")

    draw.rectangle((80, 540, 760, 1010), outline="black", width=3)
    draw.text((110, 570), "左栏 Notes", font=body_font, fill="black")
    draw.text((110, 640), "1. 早上 09:00 到达景点", font=small_font, fill="black")
    draw.text((110, 700), "2. Lunch budget: RMB 80", font=small_font, fill="black")
    draw.text((110, 760), "3. Avoid weekend crowd", font=small_font, fill="black")

    draw.rectangle((840, 540, 1520, 1010), outline="black", width=3)
    draw.text((870, 570), "右栏 Table", font=body_font, fill="black")
    draw.text((870, 650), "Type", font=small_font, fill="black")
    draw.text((1090, 650), "Value", font=small_font, fill="black")
    draw.line((870, 690, 1480, 690), fill="black", width=2)
    draw.text((870, 730), "POI", font=small_font, fill="black")
    draw.text((1090, 730), "南京路步行街", font=small_font, fill="black")
    draw.text((870, 790), "Time", font=small_font, fill="black")
    draw.text((1090, 790), "14:00 - 17:00", font=small_font, fill="black")
    draw.text((870, 850), "Language", font=small_font, fill="black")
    draw.text((1090, 850), "中文 + English", font=small_font, fill="black")

    output = ASSET_DIR / "mixed_layout.png"
    image.save(output)
    return output


def create_simple_pdf(image_path: Path) -> Path:
    output = ASSET_DIR / "printed_text.pdf"
    font_name = register_reportlab_font()
    pdf = canvas.Canvas(str(output), pagesize=A4)
    width, height = A4
    pdf.setFont(font_name, 18)
    pdf.drawString(40, height - 50, "Printed OCR PDF Test / 常规印刷体验证")
    pdf.drawString(40, height - 85, "目标：验证中英文常规印刷体场景识别准确率")
    pdf.drawImage(ImageReader(str(image_path)), 40, 140, width=520, preserveAspectRatio=True, mask="auto")
    pdf.save()
    return output


def create_complex_pdf(image_path: Path) -> Path:
    output = ASSET_DIR / "mixed_layout.pdf"
    font_name = register_reportlab_font()
    pdf = canvas.Canvas(str(output), pagesize=A4)
    width, height = A4
    pdf.setFont(font_name, 18)
    pdf.drawString(40, height - 50, "OCR PDF Test / 文档识别测试")
    pdf.drawString(40, height - 80, "目标：验证中英文混排、复杂版式和表格区域的识别情况")
    pdf.drawImage(ImageReader(str(image_path)), 40, 150, width=520, preserveAspectRatio=True, mask="auto")
    pdf.showPage()
    pdf.setFont(font_name, 16)
    pdf.drawString(40, height - 60, "Page 2 / 第二页")
    pdf.drawString(40, height - 95, "Hotel check-in: 15:00")
    pdf.drawString(40, height - 130, "门票 Ticket: 成人 120 元")
    pdf.drawString(40, height - 165, "Reminder: Keep passport / ID ready.")
    pdf.save()
    return output


if __name__ == "__main__":
    simple_image = create_simple_image()
    simple_pdf = create_simple_pdf(simple_image)
    complex_image = create_complex_image()
    complex_pdf = create_complex_pdf(complex_image)
    print(f"Generated image: {simple_image}")
    print(f"Generated pdf: {simple_pdf}")
    print(f"Generated image: {complex_image}")
    print(f"Generated pdf: {complex_pdf}")
