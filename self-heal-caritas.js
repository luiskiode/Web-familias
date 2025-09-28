// self-heal-caritas.js — v1 (alias QR->QRCode + fallbacks básicos)
console.log("🛠 self-heal-caritas.js cargado");

// Alias de compatibilidad si cargas qrcode@1 (window.QRCode)
(function aliasQR(){
  if (window.QRCode && !window.QR) {
    window.QR = window.QRCode;
    console.log("↩️ Alias QR -> QRCode");
  }
})();

// Fallback de librerías si no están presentes
(function ensureLibs(){
  const add = (src)=>{ const s=document.createElement("script"); s.src=src; s.defer=true; document.head.appendChild(s); };
  if (!(window.QR && typeof window.QR.toCanvas==="function") && !window.QRCode) {
    console.log("⏳ Cargando fallback QR (unpkg)"); add("https://unpkg.com/qrcode@1.5.3/build/qrcode.min.js");
  }
  if (!window.html2canvas) {
    console.log("⏳ Cargando fallback html2canvas"); add("https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js");
  }
})();

// Favicon inline para evitar 404 si falta
(function upsertFavicon(){
  const hasIcon = !!document.head.querySelector('link[rel="icon"]');
  if (!hasIcon) {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = "data:image/svg+xml," + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
         <rect width='64' height='64' fill='black'/>
         <text x='50%' y='52%' text-anchor='middle' dominant-baseline='middle' font-size='44' fill='white'>✚</text>
       </svg>`
    );
    document.head.appendChild(link);
    console.log("🔧 Favicon inline insertado");
  }
})();
