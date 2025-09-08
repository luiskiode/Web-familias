// api.js/error-overlay.js
// 🧯 Overlay para mostrar errores de JS y recursos en la página

(function(){
  'use strict';
  const css = "position:fixed;top:10px;right:10px;background:#300;color:#fff;padding:8px;border-radius:6px;z-index:999999;font:12px monospace;max-width:400px;overflow:auto;max-height:50vh";
  function show(msg){
    let box = document.createElement("div");
    box.style.cssText = css;
    box.textContent = "❌ "+msg;
    document.body.appendChild(box);
    setTimeout(()=>box.remove(),15000);
  }
  window.addEventListener("error", e=>{
    show(e.message||"Error JS");
  });
  window.addEventListener("unhandledrejection", e=>{
    show("Promise: "+(e.reason?.message||e.reason||""));
  });
})();