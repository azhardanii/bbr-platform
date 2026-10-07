const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Create crisp BBR Vector Logo SVG (512x512)
// Design features:
// - Deep brand gradient: rich crimson/maroon to vibrant rose-red
// - Soft ambient drop shadow and inner frosted glass shine
// - Ultra-bold geometric typography "BBR" optimized for high visibility at all sizes (from 16px tab icon to 512px app icon)
// - Golden academic star accent on the top right
const bbrIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bbrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7B1D24" />
      <stop offset="25%" stop-color="#991B1B" />
      <stop offset="60%" stop-color="#DC2626" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>
    <linearGradient id="shineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.32" />
      <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18" />
    </linearGradient>
    <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#7B1D24" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Base rounded squircle container -->
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#bbrGrad)" filter="url(#shadowFilter)" />
  <rect x="24" y="24" width="464" height="464" rx="112" fill="url(#shineGrad)" />

  <!-- Inner subtle border highlight -->
  <rect x="36" y="36" width="440" height="440" rx="100" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="6" />

  <!-- Academic Star Accent Top Right -->
  <path d="M 405 95 Q 405 125 435 125 Q 405 125 405 155 Q 405 125 375 125 Q 405 125 405 95 Z" fill="#FDE047" opacity="0.95" />

  <!-- BBR Brand Typography -->
  <text 
    x="256" 
    y="318" 
    text-anchor="middle" 
    fill="#FFFFFF" 
    font-family="system-ui, -apple-system, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" 
    font-size="192" 
    font-weight="900" 
    letter-spacing="4">BBR</text>

  <!-- Decorative baseline dots -->
  <circle cx="256" cy="388" r="9" fill="#FDE047" />
  <circle cx="224" cy="388" r="5" fill="#FFFFFF" opacity="0.75" />
  <circle cx="288" cy="388" r="5" fill="#FFFFFF" opacity="0.75" />
</svg>`;

// 2. Create OpenGraph Social Share Preview Image (1200x630)
const bbrOgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0F19" />
      <stop offset="50%" stop-color="#111827" />
      <stop offset="100%" stop-color="#1E1B4B" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DC2626" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#7C3AED" stop-opacity="0.1" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#991B1B" />
      <stop offset="50%" stop-color="#DC2626" />
      <stop offset="100%" stop-color="#E11D48" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#FCA5A5" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Ambient background glow spheres -->
  <circle cx="200" cy="180" r="320" fill="url(#glowGrad)" filter="blur(60px)" />
  <circle cx="1050" cy="450" r="280" fill="url(#glowGrad)" filter="blur(70px)" />

  <!-- Decorative grid subtle lines -->
  <g opacity="0.06" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="105" x2="1200" y2="105" />
    <line x1="0" y1="210" x2="1200" y2="210" />
    <line x1="0" y1="315" x2="1200" y2="315" />
    <line x1="0" y1="420" x2="1200" y2="420" />
    <line x1="0" y1="525" x2="1200" y2="525" />
    <line x1="200" y1="0" x2="200" y2="630" />
    <line x1="400" y1="0" x2="400" y2="630" />
    <line x1="600" y1="0" x2="600" y2="630" />
    <line x1="800" y1="0" x2="800" y2="630" />
    <line x1="1000" y1="0" x2="1000" y2="630" />
  </g>

  <!-- BBR Brand Logo Badge -->
  <g transform="translate(100, 100)">
    <rect width="130" height="130" rx="34" fill="url(#badgeGrad)" />
    <rect width="130" height="130" rx="34" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="3" />
    <text x="65" y="85" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="52" font-weight="900" letter-spacing="2">BBR</text>
    <path d="M 108 26 Q 108 36 118 36 Q 108 36 108 46 Q 108 36 98 36 Q 108 36 108 26 Z" fill="#FDE047" />
  </g>

  <!-- Platform Domain Tag -->
  <g transform="translate(255, 125)">
    <rect width="250" height="34" rx="17" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <circle cx="20" cy="17" r="5" fill="#22C55E" />
    <text x="35" y="22" fill="#E2E8F0" font-family="system-ui, sans-serif" font-size="14" font-weight="700">belajarbarengroselini.site</text>
  </g>

  <!-- Platform Category Badge -->
  <g transform="translate(255, 175)">
    <text x="0" y="24" fill="#F87171" font-family="system-ui, sans-serif" font-size="18" font-weight="800" letter-spacing="1">#1 ASISTEN AI TUGAS AKHIR &amp; SKRIPSI</text>
  </g>

  <!-- Main Headline Title -->
  <text x="100" y="325" fill="url(#textGrad)" font-family="system-ui, sans-serif" font-size="54" font-weight="900" letter-spacing="-1">
    Belajar Bareng Roselini
  </text>

  <!-- Subheadline -->
  <text x="100" y="380" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="24" font-weight="500">
    Solusi Cerdas Mahasiswa Akhir Selesaikan Skripsi Lebih Cepat &amp; Terarah
  </text>

  <!-- Feature Pills -->
  <g transform="translate(100, 440)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="220" height="46" rx="23" fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.4)" stroke-width="1.5" />
    <text x="110" y="28" text-anchor="middle" fill="#FECACA" font-family="system-ui, sans-serif" font-size="14" font-weight="700">✨ Parafrase Anti-Turnitin</text>

    <!-- Pill 2 -->
    <rect x="235" y="0" width="210" height="46" rx="23" fill="rgba(147,51,234,0.18)" stroke="rgba(147,51,234,0.4)" stroke-width="1.5" />
    <text x="340" y="28" text-anchor="middle" fill="#E9D5FF" font-family="system-ui, sans-serif" font-size="14" font-weight="700">🎓 Simulator Sidang AI</text>

    <!-- Pill 3 -->
    <rect x="460" y="0" width="220" height="46" rx="23" fill="rgba(59,130,246,0.18)" stroke="rgba(59,130,246,0.4)" stroke-width="1.5" />
    <text x="570" y="28" text-anchor="middle" fill="#BFDBFE" font-family="system-ui, sans-serif" font-size="14" font-weight="700">📊 Olah Data SPSS &amp; Bab 4</text>

    <!-- Pill 4 -->
    <rect x="695" y="0" width="230" height="46" rx="23" fill="rgba(16,185,129,0.18)" stroke="rgba(16,185,129,0.4)" stroke-width="1.5" />
    <text x="810" y="28" text-anchor="middle" fill="#A7F3D0" font-family="system-ui, sans-serif" font-size="14" font-weight="700">📝 Bedah Naskah &amp; Sitasi</text>
  </g>

  <!-- Bottom Proof Bar -->
  <g transform="translate(100, 550)">
    <text x="0" y="0" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="16" font-weight="600">
      🔥 1.400+ Mahasiswa Terbantu • 8 Fitur AI Terlengkap • Kuota Gratis Langsung Pakai
    </text>
  </g>
</svg>`;

async function main() {
  console.log('[1/4] Writing SVG files...');
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), bbrIconSvg);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), bbrIconSvg);

  const iconSvgBuffer = Buffer.from(bbrIconSvg);

  console.log('[2/4] Generating high-resolution PNG icons...');
  const p512 = await sharp(iconSvgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), p512);

  const p192 = await sharp(iconSvgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), p192);

  const p180 = await sharp(iconSvgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), p180);

  const p32 = await sharp(iconSvgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/icon-32.png'), p32);

  const p16 = await sharp(iconSvgBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/icon-16.png'), p16);

  console.log('[3/4] Generating favicon.ico...');
  // Multi-resolution ICO generator:
  // Write 32x32 PNG to favicon.ico (standard modern ICO format supported by all browsers and Next.js)
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), p32);
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), p32);

  console.log('[4/4] Generating OpenGraph social share card (og-image.png 1200x630)...');
  const ogSvgBuffer = Buffer.from(bbrOgSvg);
  const ogPng = await sharp(ogSvgBuffer).resize(1200, 630).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '../public/og-image.png'), ogPng);

  // Write site.webmanifest
  const manifest = {
    name: 'Belajar Bareng Roselini',
    short_name: 'BBR Platform',
    description: 'Platform AI Skripsi & Riset Akademik #1 di Indonesia',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#DC2626',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }
    ]
  };
  fs.writeFileSync(path.join(__dirname, '../public/site.webmanifest'), JSON.stringify(manifest, null, 2));

  console.log('✅ ALL BBR BRAND ASSETS SUCCESSFULLY GENERATED!');
}

main().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
