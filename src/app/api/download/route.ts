import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

// Helper function to sanitize titles for filenames
function sanitizeFilename(title: string) {
  // Basic transliteration
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

  // Remove non-alphanumeric characters
  cleanTitle = cleanTitle.replace(/[^\w\s-]/gi, '').trim();
  return cleanTitle || "video";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const format = req.nextUrl.searchParams.get("format") || "mp4";
  const qualityId = req.nextUrl.searchParams.get("quality_id");

  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    return NextResponse.json({ detail: "Invalid YouTube URL" }, { status: 400 });
  }

  const cleanUrl = url.split("&")[0];
  const isAudio = format === "mp3";

  try {
    // 1. First get the title to set the filename
    const getTitleCmd = spawn("yt-dlp", ["--print", "title", cleanUrl]);
    let rawTitle = "video";
    
    // We'll wrap this in a quick promise to wait for the title
    await new Promise<void>((resolve) => {
      getTitleCmd.stdout.on("data", (data) => {
        rawTitle = data.toString().trim();
      });
      getTitleCmd.on("close", () => resolve());
    });

    const title = sanitizeFilename(rawTitle);

    // 2. Set up the download format flags
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

    // 3. Create the download process streaming to stdout
    const downloadCmd = spawn("yt-dlp", ["-f", formatFlag, "-o", "-", cleanUrl]);

    // 4. Create a ReadableStream from the spawned process stdout
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

    // 5. Return the stream directly to the client with appropriate headers
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${title}.${ext}"`,
      },
    });

  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ detail: "Internal Server Error" }, { status: 500 });
  }
}
