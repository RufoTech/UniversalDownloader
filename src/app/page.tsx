"use client";
import { useState, useEffect, useRef } from "react";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVk, FaSpinner } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  formats: {
    format_id: string;
    resolution: string;
    height: number;
    ext: string;
    filesize: number;
  }[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  
  // Track the last fetched URL to prevent duplicate requests
  const lastFetchedUrl = useRef("");

  useEffect(() => {
    // Automatically fetch when a valid YouTube URL is pasted
    if (url && (url.includes("youtube.com") || url.includes("youtu.be")) && url !== lastFetchedUrl.current) {
      const timer = setTimeout(() => {
        fetchVideoInfo();
      }, 500); // 500ms debounce
      return () => clearTimeout(timer);
    }
  }, [url]);

  const fetchVideoInfo = async () => {
    if (!url) {
      setError("Zəhmət olmasa bir link daxil edin");
      return;
    }
    
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setError("Hal-hazırda yalnız YouTube linkləri dəstəklənir");
      return;
    }
    
    setError("");
    setIsLoading(true);
    setVideoInfo(null);
    lastFetchedUrl.current = url;

    try {
      const res = await fetch(`http://localhost:8001/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Failed to fetch info");
      
      setVideoInfo(data);
    } catch (err: any) {
      setError(err.message || "Video məlumatları alına bilmədi");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (format: "mp4" | "mp3", qualityId?: string) => {
    let downloadUrl = `http://localhost:8001/api/download?url=${encodeURIComponent(url)}&format=${format}`;
    if (qualityId) {
      downloadUrl += `&quality_id=${qualityId}`;
    }
    
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = ""; 
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#192540]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-[#dee5ff] font-manrope">
            Ethereal Downloader
          </div>
          <div className="hidden md:flex items-center gap-8 font-manrope text-sm font-medium tracking-wide">
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">FAQ</a>
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">API</a>
            <a className="text-[#dee5ff]/70 hover:text-[#dee5ff] transition-colors" href="#">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block px-6 py-2 rounded-xl text-sm font-bold text-[#dee5ff]/70 hover:text-[#dee5ff] transition-all">
              Sign In
            </button>
            <button className="signature-pulse px-6 py-2.5 rounded-xl text-sm font-bold text-on-primary shadow-lg hover:scale-105 transition-all duration-300 active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <h1 className="font-manrope text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-on-surface">
            Download Videos from <span className="text-primary">Any Platform</span> Instantly
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-12 font-body">
            Paste a link and download in MP3 or MP4 in seconds. Experience the alchemy of high-speed media transformation.
          </p>

          {/* URL Input Area */}
          <div className="w-full max-w-3xl glass-panel p-2 rounded-lg ghost-border shadow-2xl mb-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-6 py-4 bg-surface-container-lowest rounded-md">
              <span className="material-symbols-outlined text-tertiary mr-4">link</span>
              <input
                className="bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 w-full focus:ring-0 focus:outline-none text-body-md"
                placeholder="Paste YouTube link here"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
              />
            </div>
            <div className="flex gap-2 p-1">
              <button 
                onClick={fetchVideoInfo}
                disabled={isLoading}
                className="signature-pulse flex items-center justify-center px-8 py-4 rounded-xl font-bold text-on-primary hover:scale-102 transition-all group whitespace-nowrap disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin mr-2 text-xl" />
                ) : (
                  <span className="material-symbols-outlined mr-2">search</span>
                )}
                {isLoading ? "Axtarılır..." : "Start"}
              </button>
            </div>
          </div>
          {error && <p className="text-error font-medium mb-4 h-6">{error}</p>}
          {!error && !videoInfo && <div className="h-6 mb-4"></div>}

          {/* Video Preview Area */}
          {videoInfo && (
            <div className="w-full max-w-3xl glass-panel p-6 rounded-lg ghost-border shadow-2xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 aspect-video relative rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30">
                  <img 
                    src={videoInfo.thumbnail} 
                    alt={videoInfo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono">
                    {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="flex flex-col flex-1 text-left">
                  <h3 className="font-bold text-lg line-clamp-2 mb-4 text-on-surface" title={videoInfo.title}>
                    {videoInfo.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mb-4">
                    <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Video Yüklə (MP4)</h4>
                    <div className="flex flex-wrap gap-2">
                      {videoInfo.formats.slice(0, 4).map((format) => (
                        <button
                          key={format.format_id}
                          onClick={() => handleDownload("mp4", format.format_id)}
                          className="bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                          <span className="font-bold text-primary">{format.resolution}</span>
                          <span className="text-xs text-on-surface-variant/70">{formatBytes(format.filesize)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Audio Yüklə</h4>
                    <button 
                      onClick={() => handleDownload("mp3")}
                      className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto self-start"
                    >
                      <span className="material-symbols-outlined text-[18px] text-secondary">music_note</span>
                      <span className="font-bold text-secondary">MP3 Formatında Yüklə</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Platforms Pulse */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center gap-2">
              <FaYoutube className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">YouTube</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FaTiktok className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">TikTok</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FaInstagram className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Instagram</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FaFacebook className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Facebook</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FaVk className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">VK</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SiOpenai className="text-4xl" />
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">Sora</span>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-7xl mx-auto mt-40">
          <div className="text-center mb-20">
            <h2 className="font-manrope text-3xl md:text-5xl font-bold mb-4 text-on-surface">Divine Performance</h2>
            <p className="text-on-surface-variant max-w-lg mx-auto">Engineered for the Digital Alchemist who demands speed and precision without compromise.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2 glass-panel p-10 rounded-lg ghost-border flex flex-col justify-between min-h-[400px]">
              <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
              </div>
              <div>
                <h3 className="font-manrope text-3xl font-bold mb-4">Ultra Fast Downloads</h3>
                <p className="text-on-surface-variant leading-relaxed">Our cloud-native extraction engine processes high-bitrate content in milliseconds, bypassing traditional throttle limits.</p>
              </div>
            </div>
            {/* Secondary Card */}
            <div className="md:col-span-2 bg-surface-container p-10 rounded-lg flex flex-col justify-between">
              <div className="bg-tertiary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-tertiary text-3xl">high_quality</span>
              </div>
              <div>
                <h3 className="font-manrope text-3xl font-bold mb-4">HD &amp; 4K Video Support</h3>
                <p className="text-on-surface-variant leading-relaxed">Crystal clear resolution. From 720p to native 4K UHD, preserve every pixel of the original content creators' vision.</p>
              </div>
            </div>
            {/* Small Card 1 */}
            <div className="md:col-span-2 glass-panel p-8 rounded-lg ghost-border flex items-center gap-6">
              <div className="bg-secondary/10 p-4 rounded-xl">
                <span className="material-symbols-outlined text-secondary text-2xl">audio_file</span>
              </div>
              <div>
                <h4 className="font-manrope text-xl font-bold">MP3 Audio Extraction</h4>
                <p className="text-on-surface-variant text-sm">Convert any video into a 320kbps audio masterpiece.</p>
              </div>
            </div>
            {/* Small Card 2 */}
            <div className="md:col-span-2 glass-panel p-8 rounded-lg ghost-border flex items-center gap-6">
              <div className="bg-error/10 p-4 rounded-xl">
                <span className="material-symbols-outlined text-error text-2xl">no_accounts</span>
              </div>
              <div>
                <h4 className="font-manrope text-xl font-bold">No Login Required</h4>
                <p className="text-on-surface-variant text-sm">Download anonymously. No accounts, no trackers, pure privacy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto mt-40 bg-surface-container-low rounded-lg p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] pointer-events-none"></div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-manrope text-4xl md:text-5xl font-bold mb-8">Four Steps to <br/><span className="text-tertiary">Digital Mastery</span></h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <span className="font-manrope text-5xl font-extrabold text-outline-variant/30">01</span>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Copy link</h4>
                    <p className="text-on-surface-variant">Grab the URL from the browser bar or sharing menu of any supported platform.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="font-manrope text-5xl font-extrabold text-outline-variant/30">02</span>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Paste into downloader</h4>
                    <p className="text-on-surface-variant">Drop the link into the Ethereal field at the top of this page.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="font-manrope text-5xl font-extrabold text-outline-variant/30">03</span>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Choose MP3 or MP4</h4>
                    <p className="text-on-surface-variant">Select your desired format. High-quality audio or vibrant video.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="font-manrope text-5xl font-extrabold text-outline-variant/30">04</span>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Click download</h4>
                    <p className="text-on-surface-variant">Witness the transformation as your file is prepared instantly.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl absolute -inset-4"></div>
              <div className="relative glass-panel rounded-lg p-1 border border-white/5 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                <img alt="Cyberpunk futuristic UI preview dashboard" className="w-full h-full object-cover rounded-lg opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAh55tZGxvZ5Umb1TIPH-6lbhUrno2wFUAjHqeTN0WKk3UvNR1axIUjisAbzgWhU9mB4giWlsjaw0T7Wf_y-2TGhfGu7xeb4-D7Sg0HIbMQkMX7V84QOOCBWRDTWxs1VYwXWkkWo7dKwB5E78vfSc0nti_fgJvsTacUDyjeep_ksxaCeGRmF2qJ5Xe-dUgzQccBcY2FsH2PK-bEUCy3Cd2tpW3IB53TMFLmuW3rnh3vHFeNATwjb-6COgCo93O9joxLdDV07rHYLRo" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full signature-pulse flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-4xl text-white">play_arrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Platforms Grid */}
        <section className="max-w-7xl mx-auto mt-40 text-center">
          <h2 className="font-manrope text-3xl font-bold mb-16">Unrivaled Platform Support</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <FaYoutube className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">YouTube</span>
            </div>
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <FaTiktok className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">TikTok</span>
            </div>
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <FaInstagram className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">Instagram</span>
            </div>
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <FaFacebook className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">Facebook</span>
            </div>
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <FaVk className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">VK</span>
            </div>
            <div className="bg-surface-container hover:bg-surface-container-high p-8 rounded-lg flex flex-col items-center gap-4 transition-all group">
              <SiOpenai className="text-4xl text-on-surface-variant group-hover:text-primary transition-colors" />
              <span className="font-bold text-sm tracking-wide">Sora</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#060e20] w-full border-t border-[#40485d]/15 mt-40">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 w-full max-w-7xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-[#dee5ff] font-manrope">Ethereal Downloader</div>
            <p className="font-inter text-xs text-[#dee5ff]/50">© 2024 Ethereal Downloader. Built for the Digital Alchemist.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Terms of Service</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Privacy Policy</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Status</a>
            <a className="font-inter text-xs text-[#dee5ff]/50 hover:text-[#a3a6ff] transition-colors" href="#">Documentation</a>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer">
              <span className="material-symbols-outlined text-sm">terminal</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
