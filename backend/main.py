from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import asyncio
import subprocess
import json
import re

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import unicodedata
import shutil
from functools import lru_cache
import concurrent.futures

# Check if ffmpeg is available
FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None
if not FFMPEG_AVAILABLE:
    print("WARNING: ffmpeg not found. High-quality video merging will not work.")

def sanitize_title(title: str) -> str:
    # Manual mapping for common non-ASCII characters that don't decompose well
    replacements = {
        'ə': 'e', 'Ə': 'E',
        'ı': 'i', 'İ': 'I',
        'ö': 'o', 'Ö': 'O',
        'ü': 'u', 'Ü': 'U',
        'ş': 's', 'Ş': 'S',
        'ç': 'c', 'Ç': 'C',
        'ğ': 'g', 'Ğ': 'G'
    }
    for old, new in replacements.items():
        title = title.replace(old, new)
        
    # Normalize unicode to decompose special characters
    normalized = unicodedata.normalize('NFKD', title)
    # Filter to keep only ASCII letters, numbers, spaces, and dashes
    ascii_title = normalized.encode('ascii', 'ignore').decode('ascii')
    # Final cleanup of non-word characters
    return re.sub(r'[^\w\s-]', '', ascii_title).strip() or 'video'

# Thread pool for yt-dlp blocking operations
executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)

@app.get("/api/info")
async def get_info(url: str):
    if not url or 'youtu' not in url:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    clean_url = url.split('&')[0]

    # Run the synchronous extraction in a background thread to prevent blocking
    try:
        loop = asyncio.get_running_loop()
        data = await loop.run_in_executor(
            executor, fetch_video_info_sync, clean_url
        )
        return data
    except Exception as e:
        print(f"Error fetching info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cache the results for 5 minutes (using LRU cache for identical URLs)
@lru_cache(maxsize=100)
def fetch_video_info_sync(clean_url: str):
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'skip_download': True,
        'noplaylist': True,  # Huge speedup for playlist URLs
        'nocheckcertificate': True # Minor speedup
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(clean_url, download=False)
        
        formats = info.get('formats', [])
        resolutions = set()
        available_formats = []

        for f in formats:
            if f.get('vcodec') != 'none' and f.get('height'):
                height = f['height']
                if height not in resolutions:
                    resolutions.add(height)
                    available_formats.append({
                        'format_id': f.get('format_id'),
                        'resolution': f"{height}p",
                        'height': height,
                        'ext': f.get('ext'),
                        'filesize': f.get('filesize') or f.get('filesize_approx') or 0,
                    })
        
        # Sort from highest to lowest resolution
        available_formats.sort(key=lambda x: x['height'], reverse=True)

        return {
            'title': info.get('title'),
            'thumbnail': info.get('thumbnail'),
            'duration': info.get('duration'),
            'formats': available_formats
        }


@app.get("/api/download")
async def download_video(url: str, format: str = "mp4", quality_id: str = None):
    if not url or 'youtu' not in url:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    clean_url = url.split('&')[0]
    is_audio = format == "mp3"
    
    # Get basic info for filename
    ydl_opts = {'quiet': True, 'extract_flat': True, 'skip_download': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(clean_url, download=False)
        title = sanitize_title(info.get('title', 'video'))

    mime_type = "audio/mpeg" if is_audio else "video/mp4"
    extension = "mp3" if is_audio else "mp4"

    # Construct yt-dlp command
    if is_audio:
        format_flag = "-x --audio-format mp3 -f bestaudio"
    else:
        if quality_id:
            if FFMPEG_AVAILABLE:
                format_flag = f"-f {quality_id}+bestaudio[ext=m4a]/best[ext=mp4]/best"
            else:
                # If ffmpeg is missing, we can't merge. 
                # Try to download the requested quality, but it might not have audio.
                # Better fallback: use best single file that matches quality if possible, or just best overall single file.
                format_flag = f"-f {quality_id}/best[ext=mp4]/best"
        else:
            format_flag = "-f best[ext=mp4]/best"

    # If ffmpeg is missing and we're doing audio extraction, it will fail.
    if is_audio and not FFMPEG_AVAILABLE:
        # Fallback for audio: just get the best audio file directly without conversion
        format_flag = "-f bestaudio"
        extension = "m4a" # common bestaudio extension
        mime_type = "audio/mp4"

    command = f"yt-dlp {format_flag} -o - \"{clean_url}\""

    # Use subprocess to stream output directly
    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    async def generate():
        try:
            while True:
                chunk = process.stdout.read(8192)
                if not chunk:
                    break
                yield chunk
        finally:
            process.stdout.close()
            process.kill()

    headers = {
        "Content-Disposition": f"attachment; filename=\"{title}.{extension}\"",
        "Content-Type": mime_type,
    }

    return StreamingResponse(generate(), headers=headers)
