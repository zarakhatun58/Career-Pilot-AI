from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn


app = FastAPI(
    title="CareerPilot Authorized Scraping Test Target",
    version="1.1.0",
)


def build_item(item_id: int) -> dict:
    category_number = ((item_id - 1) % 5) + 1

    return {
        "item_id": str(item_id),
        "title": (
            f"CareerPilot Test Product {item_id}"
        ),
        "description": (
            f"Authorized scraping test product {item_id}. "
            "This page is provided specifically for "
            "CareerPilot web automation testing."
        ),
        "price": (
            f"${99.99 + item_id * 10:.2f}"
        ),
        "category": (
            f"Category {category_number}"
        ),
    }


def render_item(item: dict) -> str:
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">

        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
        >

        <title>
            {item["title"]}
        </title>

        <style>
            body {{
                font-family: Arial, sans-serif;
                background: #f4f7f9;
                margin: 0;
                padding: 40px;
            }}

            .product {{
                max-width: 700px;
                margin: 0 auto;
                background: white;
                padding: 32px;
                border-radius: 16px;
                box-shadow:
                    0 8px 30px rgba(
                        0,
                        0,
                        0,
                        0.08
                    );
            }}

            .item-id {{
                color: #667085;
                font-size: 14px;
                margin-bottom: 12px;
            }}

            .item-title {{
                font-size: 30px;
                margin-bottom: 16px;
            }}

            .item-description {{
                color: #475467;
                line-height: 1.7;
                margin-bottom: 20px;
            }}

            .price {{
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 12px;
            }}

            .category {{
                display: inline-block;
                padding: 8px 14px;
                background: #eef6ff;
                border-radius: 20px;
                color: #175cd3;
            }}
        </style>
    </head>

    <body>
        <main class="product">

            <div class="item-id">
                Item ID: {item["item_id"]}
            </div>

            <h1 class="item-title">
                {item["title"]}
            </h1>

            <div class="item-description">
                {item["description"]}
            </div>

            <div class="price">
                {item["price"]}
            </div>

            <div class="category">
                {item["category"]}
            </div>

        </main>
    </body>
    </html>
    """


@app.get(
    "/item/{item_id}",
    response_class=HTMLResponse,
)
async def get_item(item_id: int):

    if item_id < 1 or item_id > 50:
        return HTMLResponse(
            content="<h1>Item not found</h1>",
            status_code=404,
        )

    item = build_item(item_id)

    return HTMLResponse(
        content=render_item(item)
    )


@app.get("/benchmark")
async def benchmark():

    return {
        "name": (
            "CareerPilot Authorized "
            "Scraping Benchmark"
        ),
        "status": "ready",
        "total_items": 50,
        "concurrency_test": True,
        "authorization": (
            "Local application-controlled "
            "test target"
        ),
        "targets": [
            f"/item/{item_id}"
            for item_id in range(1, 51)
        ],
    }


@app.get("/")
async def root():

    return {
        "name": (
            "CareerPilot Authorized "
            "Scraping Test Target"
        ),
        "status": "running",
        "items": 50,
        "benchmark": "/benchmark",
        "endpoints": [
            "/item/1",
            "/item/2",
            "/item/3",
            "...",
            "/item/50",
        ],
    }


if __name__ == "__main__":

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8100,
        reload=False,
    )