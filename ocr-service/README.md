# OCR Service

本目录提供一个面向当前工作区的本地 OCR 服务，重点支持：

- 中文、英文混排识别
- 截图、海报、扫描件图片识别
- PDF 文档逐页 OCR
- 通过统一 HTTP 接口供后续业务模块调用

## 技术选型

- OCR 引擎：Tesseract OCR
- 服务框架：FastAPI
- PDF 处理：PyMuPDF
- 测试素材生成：Pillow + ReportLab

## 目录结构

```text
ocr-service/
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ schemas.py
│  ├─ routers/ocr.py
│  └─ services/ocr_engine.py
├─ scripts/
│  ├─ generate_test_assets.py
│  └─ verify_ocr.py
├─ tests/assets/
├─ artifacts/test_output/
├─ .env.example
└─ pyproject.toml
```

## 快速启动

```powershell
cd d:\Dev\projects\dy-hackathon\ocr-service
python -m venv .venv
winget install -e --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
Invoke-WebRequest -Uri "https://github.com/tesseract-ocr/tessdata_best/raw/main/chi_sim.traineddata" -OutFile "D:\software\Tesseract-OCR\tessdata\chi_sim.traineddata"
uv pip install --python d:\Dev\projects\dy-hackathon\ocr-service\.venv\Scripts\python.exe fastapi "uvicorn[standard]" python-multipart pymupdf pillow reportlab pydantic-settings httpx pytest pytesseract setuptools wheel
Copy-Item .env.example .env
.\.venv\Scripts\python .\scripts\generate_test_assets.py
.\.venv\Scripts\python .\scripts\verify_ocr.py
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```

## 接口

- `GET /health`：健康检查
- `POST /ocr/parse`：单文件 OCR，支持 `png/jpg/webp/pdf`
- `POST /ocr/batch`：批量 OCR

## 返回结构

核心输出包含：

- `status`
- `file_name`
- `file_type`
- `page_count`
- `pages[].text`
- `pages[].lines[].text`
- `pages[].lines[].score`
- `pages[].lines[].bbox`

## 注意事项

- 当前实现依赖本机安装的 `Tesseract OCR`，默认路径为 `D:\software\Tesseract-OCR\tesseract.exe`。
- 当前中文语言包建议使用 `tessdata_best/chi_sim`，常规印刷体验证已达到 `100%` 术语命中率。
- 若安装目录不同，请修改 `.env` 中的 `OCR_TESSERACT_CMD` 与 `OCR_TESSDATA_PREFIX`。
- 工作区暂无现成业务服务代码，因此本实现提供可复用的独立 OCR API，便于后续前端、小程序或解析链路接入。
