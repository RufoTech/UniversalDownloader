import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
    return NextResponse.json({ detail: "Invalid YouTube URL" }, { status: 400 });
  }

  // Basic sanitization
  const cleanUrl = url.split("&")[0];

  try {
    // Run yt-dlp to get JSON info
    const { stdout, stderr } = await execAsync(`yt-dlp -J "${cleanUrl}"`);
    
    if (stderr && !stdout) {
      console.error("yt-dlp stderr:", stderr);
      throw new Error("Failed to extract info");
    }

    const info = JSON.parse(stdout);

    // Format the response
    const formats = info.formats || [];
    const availableFormats: any[] = [];
    const seenHeights = new Set();

    formats.forEach((f: any) => {
      // We want video formats with a valid height and not audio-only
      if (f.vcodec !== "none" && f.vcodec !== "" && f.height && f.height > 0) {
        if (!seenHeights.has(f.height)) {
          seenHeights.add(f.height);
          
          let ext = "mp4";
          if (f.ext) {
            ext = f.ext;
          }

          availableFormats.push({
            format_id: f.format_id,
            resolution: `${f.height}p`,
            height: f.height,
            ext: ext,
            filesize: f.filesize || f.filesize_approx || 0,
          });
        }
      }
    });

    // Sort by height descending
    availableFormats.sort((a, b) => b.height - a.height);

    return NextResponse.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats: availableFormats,
    });

  } catch (error: any) {
    console.error("Info extraction error:", error);
    return NextResponse.json({ detail: error.message || "Failed to fetch info" }, { status: 500 });
  }
}
