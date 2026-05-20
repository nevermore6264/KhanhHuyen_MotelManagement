export default function ScriptCaiDatBanDau() {
  const code = `(function(){try{var t=localStorage.getItem("motel_theme");var l=localStorage.getItem("motel_lang");if(t==="dark")document.documentElement.setAttribute("data-theme","dark");if(l==="en")document.documentElement.setAttribute("lang","en");}catch(e){}})();`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
