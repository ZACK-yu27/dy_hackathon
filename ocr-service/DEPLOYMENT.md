# OCR 安装部署文档

## 1. 适用范围

本方案用于当前工作区内的旅游内容识别场景，重点覆盖：

- 攻略截图 OCR
- 海报/卡片图片 OCR
- 中英文混排 PDF 文档 OCR
- 后续业务模块通过 HTTP 接口调用 OCR 服务

## 2. 环境评估结论

- 操作系统：Windows 10 Home China x64
- Python：3.13
- Node.js：v24
- Docker：当前机器未安装
- GPU：Intel Arc Graphics
- 存储：D 盘可用空间约 517GB

结论：

- 当前环境适合先落地 `Tesseract + FastAPI` 的本地 CPU 服务。
- 由于没有 Docker，不采用容器化首发部署。
- 由于当前显卡为 Intel Arc，本次优先采用 CPU 路径保证兼容性。

## 3. 选型说明

### 3.1 主方案

- OCR：Tesseract OCR
- 服务层：FastAPI
- PDF 转图：PyMuPDF
- 测试素材：Pillow + ReportLab

### 3.2 选型原因

- 对中文印刷体效果更稳
- 支持中英文混排
- 支持图片与文档识别
- 可直接被 Python 服务封装，便于和后续旅行内容解析流程对接

### 3.3 备选方案

- PaddleOCR：适合作为后续增强方案，但当前 Windows 本机安装链路不如 Tesseract 稳定
- 商用 OCR SDK：可作为未来高 SLA 或发票/证照识别场景增强方案

## 4. 安装步骤

### 4.1 创建虚拟环境

```powershell
cd d:\Dev\projects\dy-hackathon\ocr-service
python -m venv .venv
```

### 4.2 安装基础依赖

```powershell
uv pip install --python d:\Dev\projects\dy-hackathon\ocr-service\.venv\Scripts\python.exe `
  fastapi "uvicorn[standard]" python-multipart pymupdf pillow reportlab `
  pydantic-settings httpx pytest pytesseract setuptools wheel
```

### 4.3 安装 Tesseract 与中文语言包

```powershell
winget install -e --id UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements
Invoke-WebRequest -Uri "https://github.com/tesseract-ocr/tessdata_best/raw/main/chi_sim.traineddata" `
  -OutFile "D:\software\Tesseract-OCR\tessdata\chi_sim.traineddata"
```

说明：

- 若 `winget` 提示软件已安装，可直接补充中文语言包。
- 推荐将中文语言包升级为 `tessdata_best/chi_sim` 以提升混排识别准确率。
- 当前服务使用 `eng + chi_sim` 混合识别。

## 5. 服务启动

```powershell
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```

默认配置：

- 端口：`8011`
- 跨域：`*`
- 日志级别：`INFO`
- Tesseract 可执行文件：`D:\software\Tesseract-OCR\tesseract.exe`

## 6. 接口说明

### 6.1 健康检查

```http
GET /health
```

### 6.2 单文件识别

```http
POST /ocr/parse
Content-Type: multipart/form-data
file=<png|jpg|webp|pdf>
```

### 6.3 批量识别

```http
POST /ocr/batch
Content-Type: multipart/form-data
files=<multiple files>
```

## 7. 标准化返回

返回中统一包含：

- `status`
- `file_name`
- `file_type`
- `elapsed_ms`
- `page_count`
- `pages[].text`
- `pages[].lines[].text`
- `pages[].lines[].score`
- `pages[].lines[].bbox`
- `warnings`

## 8. 测试验证

### 8.1 生成样例素材

```powershell
.\.venv\Scripts\python .\scripts\generate_test_assets.py
```

生成文件：

- `tests/assets/printed_text.png`
- `tests/assets/printed_text.pdf`
- `tests/assets/mixed_layout.png`
- `tests/assets/mixed_layout.pdf`

### 8.2 执行验证

```powershell
.\.venv\Scripts\python .\scripts\verify_ocr.py
```

输出：

- 控制台打印识别结果摘要
- `artifacts/test_output/verification_report.json`
- 常规印刷体样例命中率目标：`>=95%`

## 9. 异常处理

当前服务已内置以下处理：

- 文件类型不支持：返回 `415`
- 上传空文件：返回 `400`
- OCR 执行异常：返回 `500`
- 批量任务局部失败：返回 `partial_success`

## 10. 常见问题排查

### 10.1 模型首次加载慢

原因：首次初始化 OCR 引擎或首次处理高分辨率 PDF。

处理：

- 先调用一次 `/health` 与 `/ocr/parse` 做预热

### 10.2 Python 依赖异常

若出现 `setuptools` 相关问题：

```powershell
uv pip install --python d:\Dev\projects\dy-hackathon\ocr-service\.venv\Scripts\python.exe setuptools wheel
```

### 10.3 端口占用

修改 `.env` 中的 `OCR_APP_PORT`，或启动时显式指定其他端口。

### 10.4 识别效果波动

建议优先检查：

- 图片清晰度
- PDF 转图分辨率
- 文字是否过度倾斜
- 是否属于手写、艺术字、严重遮挡场景

## 11. 维护建议

- 固定 `pytesseract` 与 Tesseract 版本
- 保留一批固定测试图片/PDF，升级前后做回归对比
- 后续若接入真实业务链路，可增加请求 ID、调用方标识与耗时埋点
