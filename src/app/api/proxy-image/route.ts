import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const title = req.nextUrl.searchParams.get("title") || "image";

  if (!url) {
    return NextResponse.json({ detail: "URL required" }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");

    // Get the content type from the original image to set the right extension
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const ext = contentType.split("/")[1] || "jpg";

    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${title}.${ext}"`);

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
