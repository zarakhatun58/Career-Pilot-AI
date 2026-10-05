# Career-pilot

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-vavxsaeh)


## Backend Integration

CareerPilot uses the FastAPI backend for application services and authentication.

Set:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

The Web Automation dashboard is available at `/dashboard/web-automation` and connects to:

- `POST /api/scraping/jobs`
- `POST /api/scraping/jobs/{job_id}/start`
- `GET /api/scraping/jobs`
- `GET /api/scraping/jobs/{job_id}`
- `GET /api/scraping/jobs/{job_id}/records`
- `GET /api/scraping/jobs/{job_id}/events`

For the local authorized benchmark, run the CareerPilot FastAPI backend on port `8000` and the authorized Playwright test target on port `8100`.
