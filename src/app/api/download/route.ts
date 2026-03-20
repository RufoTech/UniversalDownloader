import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

function sanitizeFilename(title: string) {
  const replacements: Record<string, string> = {
    'ə': 'e', 'Ə': 'E', 'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O', 'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S', 'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G'
  };

  let cleanTitle = title;
  for (const [key, value] of Object.entries(replacements)) {
    cleanTitle = cleanTitle.replace(new RegExp(key, 'g'), value);
  }

  cleanTitle = cleanTitle.replace(/[^\w\s-]/gi, '').trim();
  return cleanTitle || "video";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const format = req.nextUrl.searchParams.get("format") || "mp4";
  const qualityId = req.nextUrl.searchParams.get("quality_id");
  const itemId = req.nextUrl.searchParams.get("item_id"); // Used if downloading a specific item from a playlist/carousel

  if (!url) {
    return NextResponse.json({ detail: "Link daxil edilməyib" }, { status: 400 });
  }

  let cleanUrl = url;
  if (url.includes("tiktok.com")) {
    cleanUrl = cleanUrl.replace("/photo/", "/video/");
  } else {
    cleanUrl = url.split("&")[0];
  }
  const isAudio = format === "mp3";

  try {
    const getTitleCmd = spawn("yt-dlp", ["--print", "title", cleanUrl]);
    let rawTitle = "video";
    
    await new Promise<void>((resolve) => {
      getTitleCmd.stdout.on("data", (data) => {
        rawTitle = data.toString().trim();
      });
      getTitleCmd.on("close", () => resolve());
    });

    const title = sanitizeFilename(rawTitle);

    let formatFlag = "";
    let ext = "mp4";
    let mimeType = "video/mp4";

    if (isAudio) {
      formatFlag = "bestaudio";
      ext = "m4a";
      mimeType = "audio/mp4";
    } else {
      if (qualityId) {
        formatFlag = `${qualityId}/best[ext=mp4]/best`;
      } else {
        formatFlag = "best[ext=mp4]/best";
      }
    }

    const args = ["-f", formatFlag, "-o", "-"];
    if (itemId && itemId !== "undefined") {
      // Sometimes we can use --match-filter or similar if we want a specific ID, 
      // but for basic usage we'll just download the URL. If it's a specific photo, 
      // we might handle that via proxy-image anyway.
    }
    args.push(cleanUrl);

    const downloadCmd = spawn("yt-dlp", args);

    const stream = new ReadableStream({
      start(controller) {
        downloadCmd.stdout.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        downloadCmd.stdout.on("end", () => {
          controller.close();
        });

        downloadCmd.stderr.on("data", (data) => {
          console.log(`yt-dlp stderr: ${data}`);
        });

        downloadCmd.on("error", (err) => {
          console.error("yt-dlp process error:", err);
          controller.error(err);
        });
      },
      cancel() {
        downloadCmd.kill();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${title}.${ext}"`,
      },
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ detail: "Daxili Server Xətası" }, { status: 500 });
  }
}
