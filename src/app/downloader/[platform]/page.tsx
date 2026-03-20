"use client";
import { useState, useRef, use } from "react";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVk, FaSpinner, FaArrowLeft, FaImage } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";
import Link from "next/link";

interface MediaItem {
  id: string;
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
  isImageOnly: boolean;
}

const platformConfig: any = {
  youtube: { name: 'YouTube', icon: FaYoutube, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', placeholder: 'YouTube linkini yapışdırın...' },
  tiktok: { name: 'TikTok', icon: FaTiktok, color: 'text-black dark:text-white', bg: 'bg-gray-500/10', border: 'border-gray-500/20', placeholder: 'TikTok linkini yapışdırın...' },
  instagram: { name: 'Instagram', icon: FaInstagram, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', placeholder: 'Instagram Reels/Post/Story linkini yapışdırın...' },
  facebook: { name: 'Facebook', icon: FaFacebook, color: 'text-blue-600', bg: 'bg-blue-600/10', border: 'border-blue-600/20', placeholder: 'Facebook linkini yapışdırın...' },
  vk: { name: 'VK', icon: FaVk, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', placeholder: 'VK linkini yapışdırın...' }
};

export default function DownloaderPage({ params }: { params: Promise<{ platform: string }> }) {
  const resolvedParams = use(params);
  const platformKey = resolvedParams.platform.toLowerCase();
  const config = platformConfig[platformKey] || platformConfig.youtube;
  const Icon = config.icon;

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  
  const lastFetchedUrl = useRef("");

  const fetchInfo = async () => {
    if (!url) {
      setError("Zəhmət olmasa bir link daxil edin");
      return;
    }
    
    setError("");
    setIsLoading(true);
    setItems(null);
    lastFetchedUrl.current = url;

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Məlumat alına bilmədi");
      
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return 'Ölçü yoxdur';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (format: "mp4" | "mp3", qualityId?: string) => {
    let downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}`;
    if (qualityId) {
      downloadUrl += `&quality_id=${qualityId}`;
    }
    window.open(downloadUrl, "_blank");
  };

  const handleImageDownload = (imgUrl: string, title: string) => {
    const downloadUrl = `/api/proxy-image?url=${encodeURIComponent(imgUrl)}&title=${encodeURIComponent(title)}`;
    window.open(downloadUrl, "_blank");
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#192540]/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-4 text-2xl font-black tracking-tighter text-[#dee5ff] font-manrope hover:opacity-80 transition-opacity">
            <FaArrowLeft className="text-lg" />
            Ethereal Downloader
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 min-h-screen">
        <section className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${config.bg} ${config.border} border`}>
            <Icon className={`text-5xl ${config.color}`} />
          </div>
          
          <h1 className="font-manrope text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-on-surface">
            {config.name} <span className="text-primary">Downloader</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mb-12 font-body">
            {config.name} platformasından ən yüksək keyfiyyətdə video, səs və şəkilləri yükləyin.
          </p>

          <div className="w-full max-w-3xl glass-panel p-2 rounded-lg ghost-border shadow-2xl mb-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-6 py-4 bg-surface-container-lowest rounded-md">
              <span className="material-symbols-outlined text-tertiary mr-4">link</span>
              <input
                className="bg-transparent border-none text-on-surface placeholder:text-on-surface-variant/40 w-full focus:ring-0 focus:outline-none text-body-md"
                placeholder={config.placeholder}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchInfo()}
              />
            </div>
            <div className="flex gap-2 p-1">
              <button 
                onClick={fetchInfo}
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
          {!error && !items && <div className="h-6 mb-4"></div>}

          {/* Results Area */}
          {items && items.length > 0 && (
            <div className="w-full max-w-4xl mt-8 flex flex-col gap-6">
              {items.map((item, index) => (
                <div key={item.id || index} className="glass-panel p-6 rounded-lg ghost-border shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 aspect-square md:aspect-video relative rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30 bg-black/50">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-contain md:object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaImage className="text-4xl text-on-surface-variant/30" />
                        </div>
                      )}
                      {item.duration > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white">
                          {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-lg line-clamp-2 mb-4 text-on-surface" title={item.title}>
                        {item.title}
                      </h3>
                      
                      {!item.isImageOnly && item.formats.length > 0 && (
                        <div className="flex flex-col gap-2 mb-4">
                          <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Video Yüklə (MP4)</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.formats.slice(0, 6).map((format) => (
                              <button
                                key={format.format_id}
                                onClick={() => handleDownload("mp4", format.format_id)}
                                className="bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2"
                              >
                                <span className="font-bold text-primary">{format.resolution}</span>
                                {format.filesize > 0 && (
                                  <span className="text-xs text-on-surface-variant/70">{formatBytes(format.filesize)}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 mt-auto pt-4 border-t border-outline-variant/20">
                        {!item.isImageOnly && (
                          <button 
                            onClick={() => handleDownload("mp3")}
                            className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px] text-secondary">music_note</span>
                            <span className="font-bold text-secondary">Səs (MP3)</span>
                          </button>
                        )}
                        
                        {item.thumbnail && (
                          <button 
                            onClick={() => handleImageDownload(item.thumbnail, item.title)}
                            className="bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/20 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px] text-tertiary">image</span>
                            <span className="font-bold text-tertiary">Şəkil (JPG/PNG)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-[#060e20] w-full border-t border-[#40485d]/15 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-8 w-full max-w-7xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-[#dee5ff] font-manrope">Ethereal Downloader</div>
            <p className="font-inter text-xs text-[#dee5ff]/50">© 2026 Ethereal Downloader. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
