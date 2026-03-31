import { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, Share2, Check, Palette } from 'lucide-react';

const THEMES = [
  { id: 'purple', bg: ['#1a0533', '#2d1b69', '#1e1b4b'], accent: '#a855f7', text: '#e9d5ff' },
  { id: 'gold',   bg: ['#1a1200', '#3d2c00', '#1a1200'], accent: '#f59e0b', text: '#fef3c7' },
  { id: 'teal',   bg: ['#001a1a', '#003d3d', '#001a1a'], accent: '#14b8a6', text: '#ccfbf1' },
  { id: 'rose',   bg: ['#1a0010', '#3d0020', '#1a0010'], accent: '#f43f5e', text: '#ffe4e6' },
];

export default function ShareProfileModal({ artist, onClose }) {
  const canvasRef = useRef(null);
  const [theme, setTheme] = useState(THEMES[0]);
  const [tagline, setTagline] = useState('Hey, find me on SpotMyStar ⭐');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const USER_PANEL_URL = import.meta.env.VITE_USER_PANEL_URL || 'https://spotmystar-user.vercel.app';
  // Use artist_code (e.g., A3527) as primary identifier — guaranteed unique, no slug issues
  const profileIdentifier = artist?.artist_code ? `A${artist.artist_code}` : (artist?.id || '');
  const profileUrl = `${USER_PANEL_URL}/artist/${profileIdentifier}`;
  const displayName = artist?.stage_name || artist?.full_name || 'Artist';
  const category = artist?.category_name || 'Artist';
  const city = artist?.primary_city || artist?.city || '';
  const rating = parseFloat(artist?.rating || 0);
  const totalBookings = parseInt(artist?.total_bookings || 0);

  // Draw poster on canvas
  const drawPoster = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, theme.bg[0]);
    grad.addColorStop(0.5, theme.bg[1]);
    grad.addColorStop(1, theme.bg[2]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = theme.accent;
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.15, 280, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.1, H * 0.85, 200, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Top brand bar
    ctx.fillStyle = theme.accent + '22';
    ctx.fillRect(0, 0, W, 80);
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ SpotMyStar', W / 2, 52);

    // Profile image (circular)
    const imgY = 140, imgR = 160;
    const imgX = W / 2;

    // Glow ring
    ctx.save();
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(imgX, imgY + imgR, imgR + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw profile image
    try {
      const imgSrc = artist?.profile_image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8B5CF6&color=fff&size=320&bold=true`;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgSrc;
      });

      ctx.save();
      ctx.beginPath();
      ctx.arc(imgX, imgY + imgR, imgR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, imgX - imgR, imgY, imgR * 2, imgR * 2);
      ctx.restore();
    } catch {
      // Fallback: colored circle with initial
      ctx.save();
      const fbGrad = ctx.createRadialGradient(imgX, imgY + imgR, 0, imgX, imgY + imgR, imgR);
      fbGrad.addColorStop(0, theme.accent);
      fbGrad.addColorStop(1, theme.bg[1]);
      ctx.fillStyle = fbGrad;
      ctx.beginPath();
      ctx.arc(imgX, imgY + imgR, imgR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${imgR}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(displayName.charAt(0).toUpperCase(), imgX, imgY + imgR);
      ctx.textBaseline = 'alphabetic';
    }

    // Badges
    let badgeX = W / 2;
    const badgeY = imgY + imgR * 2 + 30;
    const badges = [];
    if (rating >= 4.5) badges.push('⭐ Top Rated');
    if (totalBookings >= 50) badges.push(`🎯 ${totalBookings}+ Bookings`);
    if (artist?.is_verified) badges.push('✓ Verified');

    if (badges.length > 0) {
      const totalW = badges.length * 200 - 20;
      let bx = W / 2 - totalW / 2 + 90;
      badges.forEach(badge => {
        ctx.fillStyle = theme.accent + '33';
        roundRect(ctx, bx - 90, badgeY - 24, 180, 36, 18);
        ctx.fillStyle = theme.accent;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(badge, bx, badgeY);
        bx += 200;
      });
    }

    const textStartY = badges.length > 0 ? badgeY + 60 : imgY + imgR * 2 + 60;

    // Artist name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = theme.accent;
    ctx.shadowBlur = 20;
    ctx.fillText(displayName, W / 2, textStartY);
    ctx.shadowBlur = 0;

    // Category pill
    ctx.fillStyle = theme.accent + '33';
    roundRect(ctx, W / 2 - 120, textStartY + 20, 240, 50, 25);
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(category, W / 2, textStartY + 52);

    // City
    if (city) {
      ctx.fillStyle = theme.text + 'cc';
      ctx.font = '26px sans-serif';
      ctx.fillText(`📍 ${city}`, W / 2, textStartY + 110);
    }

    // Divider
    const divY = textStartY + 150;
    ctx.strokeStyle = theme.accent + '44';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, divY); ctx.lineTo(W * 0.8, divY);
    ctx.stroke();

    // Tagline
    ctx.fillStyle = theme.text;
    ctx.font = 'italic 34px sans-serif';
    ctx.fillText(`"${tagline}"`, W / 2, divY + 60);

    // Bottom CTA box
    const ctaY = H - 200;
    const ctaGrad = ctx.createLinearGradient(W * 0.1, ctaY, W * 0.9, ctaY);
    ctaGrad.addColorStop(0, theme.accent + '44');
    ctaGrad.addColorStop(1, theme.accent + '22');
    ctx.fillStyle = ctaGrad;
    roundRect(ctx, W * 0.1, ctaY, W * 0.8, 100, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🎤 Book Me Now', W / 2, ctaY + 42);
    ctx.fillStyle = theme.text + 'bb';
    ctx.font = '22px sans-serif';
    ctx.fillText(profileUrl, W / 2, ctaY + 78);

    // Bottom brand
    ctx.fillStyle = theme.accent + '66';
    ctx.fillRect(0, H - 60, W, 60);
    ctx.fillStyle = theme.text;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('spotmystar-user.vercel.app  •  Discover & Book Artists', W / 2, H - 22);
  };

  // Helper: rounded rect fill
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  useEffect(() => {
    drawPoster();
  }, [theme, tagline, artist]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${displayName.replace(/\s+/g, '-')}-spotmystar.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const canvas = canvasRef.current;
    try {
      // Try native share with image
      const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
      const file = new File([blob], `${displayName}-spotmystar.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `Book ${displayName} on SpotMyStar`,
          text: `${tagline}\n\nBook me: ${profileUrl}`,
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `Book ${displayName} on SpotMyStar`,
          text: `${tagline}\n\nBook me: ${profileUrl}`,
          url: profileUrl,
        });
      } else {
        // Fallback: WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(`${tagline}\n\nBook me on SpotMyStar: ${profileUrl}`)}`, '_blank');
      }
    } catch { /* user cancelled */ }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${tagline}\n\nBook me on SpotMyStar 🎤\n${profileUrl}`)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Share2 size={20} className="text-purple-400" /> Share Profile</h2>
            <p className="text-gray-400 text-sm mt-0.5">Generate a poster & share your profile</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Canvas Preview */}
          <div className="rounded-xl overflow-hidden border border-gray-700 bg-gray-950">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: '360px', objectFit: 'contain' }} />
          </div>

          {/* Theme Picker */}
          <div>
            <p className="text-sm text-gray-400 mb-2 flex items-center gap-1"><Palette size={14} /> Theme</p>
            <div className="flex gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`w-10 h-10 rounded-xl border-2 transition ${theme.id === t.id ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ background: `linear-gradient(135deg, ${t.bg[0]}, ${t.bg[1]})`, boxShadow: theme.id === t.id ? `0 0 12px ${t.accent}` : 'none' }}
                />
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Tagline</p>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              maxLength={60}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Your tagline..."
            />
          </div>

          {/* Profile Link */}
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-700">
            <span className="text-gray-400 text-sm flex-1 truncate">{profileUrl}</span>
            <button onClick={handleCopyLink} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium transition flex-shrink-0">
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition"
            >
              <Share2 size={18} /> Share Now
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
            >
              <Download size={18} /> Download
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl font-semibold hover:bg-green-500/30 transition col-span-2"
            >
              <span className="text-lg">💬</span> Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
