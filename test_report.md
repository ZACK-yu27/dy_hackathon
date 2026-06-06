# OCR Service Real Test Report

## 1. Test Objective

Start `ocr-service`, use the images in `d:\Dev\projects\dy-hackathon\mock_pics\` for real uploads, record the full execution process, and verify whether the pipeline `image -> Kimi extraction -> Kimi structuring -> MySQL` can complete successfully.

## 2. Test Environment

- Project root: `d:\Dev\projects\dy-hackathon`
- Service directory: `d:\Dev\projects\dy-hackathon\ocr-service`
- Test image directory: `d:\Dev\projects\dy-hackathon\mock_pics`
- Service URL: `http://127.0.0.1:8012`
- Health check result:

```json
{
  "status": "ok",
  "service": "Travel Structured Ingestion Service",
  "port": 8012,
  "model": "kimi-for-coding",
  "database_configured": true
}
```

- Database baseline before test:
  - `travel_structured_items.max_id = 0`
  - `travel_structured_items.total = 0`

## 3. Test Process

### 3.1 Service Startup Confirmation

Verified `GET /health` on port `8012`; service is running normally and MySQL is configured.

### 3.2 First Request Attempt

The first batch request used PowerShell `Invoke-RestMethod -Form`, but the current PowerShell environment does not support the `-Form` parameter. This was an environment/tooling issue, not a service-side failure.

Observed error:

```text
找不到与参数名称“Form”匹配的参数。
```

### 3.3 Formal Real Test Method

To avoid PowerShell multipart compatibility issues and preserve complete records, I added and executed the script below:

- Test runner: `d:\Dev\projects\dy-hackathon\ocr-service\scripts\run_mock_pics_test.py`
- Raw result artifact: `d:\Dev\projects\dy-hackathon\ocr-service\artifacts\test_runs\mock_pics_test_results.json`

Script behavior:

1. Read database baseline.
2. Re-check `GET /health`.
3. Upload the 9 JPG files in `mock_pics` one by one to `POST /ingest/upload`.
4. Record request start time, elapsed time, HTTP status code, and response payload/error detail.
5. Query MySQL again after the run and compare inserted rows.

## 4. Test Summary

- Test image count: `9`
- Successful requests: `0`
- Failed requests: `9`
- Average single-request elapsed time: about `6.007s`
- Database rows before test: `0`
- Database rows after test: `0`
- Newly inserted rows: `0`

Conclusion: local service availability is normal, but all real image uploads failed in the Kimi file extraction stage. The pipeline did not reach structuring or MySQL insertion.

## 5. Detailed Results

| File | Start Time | Elapsed (s) | HTTP | Result |
| --- | --- | ---: | ---: | --- |
| `微信图片_20260606194611_493_141.jpg` | `2026-06-06T19:56:55` | `6.108` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194613_494_141.jpg` | `2026-06-06T19:57:01` | `6.301` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194617_495_141.jpg` | `2026-06-06T19:57:07` | `6.163` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194622_496_141.jpg` | `2026-06-06T19:57:13` | `6.021` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194631_497_141.jpg` | `2026-06-06T19:57:19` | `5.804` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194637_498_141.jpg` | `2026-06-06T19:57:25` | `5.940` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194639_499_141.jpg` | `2026-06-06T19:57:31` | `5.680` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194641_500_141.jpg` | `2026-06-06T19:57:37` | `5.982` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |
| `微信图片_20260606194643_501_141.jpg` | `2026-06-06T19:57:43` | `6.064` | `500` | Kimi `GET /files/{file_id}/content` returned `404` |

Representative response:

```json
{
  "detail": "Ingest processing failed: Client error '404 Not Found' for url 'https://api.kimi.com/coding/v1/files/fak1p5b8obbi11gt7yii/content'\nFor more information check: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/404"
}
```

## 6. Database Verification

MySQL verification result:

- Before test:

```json
{
  "max_id": 0,
  "total": 0
}
```

- After test:

```json
{
  "max_id": 0,
  "total": 0
}
```

- Inserted rows returned by query: `[]`

Conclusion: no structured data was written into `travel_structured_items`.

## 7. Failure Location and Analysis

The failure is not in FastAPI upload reception, file temporary storage, or MySQL connection. The common failure point is the Kimi extraction client:

- File upload is sent to `POST /files`
- The returned `file_id` is then used to request `GET /files/{file_id}/content`
- All 9 requests fail at this second step with `404 Not Found`

Current code location:

- `d:\Dev\projects\dy-hackathon\ocr-service\app\services\kimi_client.py`
- Relevant logic:

```python
upload_response = client.post(
    self._api_url("/files"),
    headers=self._headers(),
    data={"purpose": "file-extract"},
    files={"file": (file_path.name, file_obj)},
)
upload_response.raise_for_status()
file_id = upload_response.json()["id"]

content_response = client.get(
    self._api_url(f"/files/{file_id}/content"),
    headers=self._headers(),
)
content_response.raise_for_status()
```

Current judgment:

1. The upload request likely succeeds because a `file_id` is returned each time.
2. The endpoint or calling sequence for reading extracted content is likely incorrect for the current Kimi API.
3. Another possibility is that file extraction is asynchronous and the service should poll a status endpoint first instead of immediately calling `/content`.
4. Because every image shows the same pattern and the database remains unchanged, this is a systemic integration issue, not a single-image quality issue.

## 8. Deliverables Produced

- Report file: `d:\Dev\projects\dy-hackathon\test_report.md`
- Raw structured test result: `d:\Dev\projects\dy-hackathon\ocr-service\artifacts\test_runs\mock_pics_test_results.json`
- Test runner script: `d:\Dev\projects\dy-hackathon\ocr-service\scripts\run_mock_pics_test.py`

## 9. Next Recommended Actions

1. Verify the latest Kimi file extraction API documentation and confirm the correct post-upload retrieval endpoint.
2. Check whether the returned `file_id` needs a separate extraction task query or status polling before content retrieval.
3. Add explicit logging for Kimi upload response payloads so the exact API contract can be compared against the current code.
4. After correcting the Kimi extraction logic, rerun the same script to confirm OCR text extraction, structuring, and MySQL insertion all succeed.
