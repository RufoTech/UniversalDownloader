"use client";
import Link from "next/link";
import { FaYoutube, FaTiktok, FaInstagram, FaFacebook, FaVk } from "react-icons/fa";
import { SiOpenai } from "react-icons/si";

export default function Home() {
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
              Daxil ol
            </button>
            <button className="signature-pulse px-6 py-2.5 rounded-xl text-sm font-bold text-on-primary shadow-lg hover:scale-105 transition-all duration-300 active:scale-95">
              Başla
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <h1 className="font-manrope text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-on-surface">
            İstədiyiniz Platformadan <span className="text-primary">Anında</span> Yükləyin
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mb-12 font-body">
            Sürətli, reklamsız və limitsiz. Yükləməyə başlamaq üçün aşağıdakı platformalardan birini seçin.
          </p>

          {/* Social Platforms Grid (Main interaction point) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl mt-8">
            <Link href="/downloader/youtube" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-red-500/30">
              <FaYoutube className="text-5xl text-on-surface-variant group-hover:text-red-500 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">YouTube</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">Video (MP4) & Səs (MP3)</span>
              </div>
            </Link>
            
            <Link href="/downloader/tiktok" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-gray-500/30">
              <FaTiktok className="text-5xl text-on-surface-variant group-hover:text-white transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">TikTok</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">Video, Səs & Şəkil</span>
              </div>
            </Link>
            
            <Link href="/downloader/instagram" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-pink-500/30">
              <FaInstagram className="text-5xl text-on-surface-variant group-hover:text-pink-500 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">Instagram</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">Video, Reels, Story & Şəkil</span>
              </div>
            </Link>
            
            <Link href="/downloader/facebook" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-blue-600/30">
              <FaFacebook className="text-5xl text-on-surface-variant group-hover:text-blue-600 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">Facebook</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">Video & Şəkil</span>
              </div>
            </Link>
            
            <Link href="/downloader/vk" className="bg-surface-container hover:bg-surface-container-high p-8 rounded-xl flex flex-col items-center gap-4 transition-all group hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-blue-400/30">
              <FaVk className="text-5xl text-on-surface-variant group-hover:text-blue-400 transition-colors" />
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg tracking-wide">VK</span>
                <span className="text-xs text-on-surface-variant mt-1 text-center">Video & Şəkil</span>
              </div>
            </Link>
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
