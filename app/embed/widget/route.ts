import { getAdminSettings } from "@/lib/admin-settings";

function createWidgetScript(defaultIconUrl: string) {
  return String.raw`
(function () {
  if (window.__collegeInfoChatbotWidgetLoaded) {
    return;
  }

  window.__collegeInfoChatbotWidgetLoaded = true;

  var script = document.currentScript;
  var origin = new URL(script.src).origin;
  var lang = script.getAttribute("data-lang") || "ja";
  var iconUrl = script.getAttribute("data-icon-url") || ${JSON.stringify(defaultIconUrl)};
  var chatUrl = origin + "/embed/chat?lang=" + encodeURIComponent(lang);

  var host = document.createElement("div");
  host.id = "college-info-chatbot-widget";
  document.body.appendChild(host);

  var shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = ''
    + '<style>'
    + ':host{all:initial;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}'
    + '.panel{position:fixed;right:20px;bottom:92px;width:390px;height:min(640px,calc(100vh - 120px));border:1px solid rgba(255,255,255,.16);border-radius:18px;overflow:hidden;background:#020617;box-shadow:0 24px 80px rgba(0,0,0,.36);z-index:2147483646;display:none}'
    + '.panel.open{display:block}'
    + '.frame{width:100%;height:100%;border:0;background:#020617}'
    + '.button{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border:0;border-radius:999px;background:#2dd4bf;color:#020617;box-shadow:0 18px 42px rgba(0,0,0,.32);z-index:2147483647;display:flex;align-items:center;justify-content:center;cursor:pointer;font:700 16px/1 Inter,ui-sans-serif,system-ui,sans-serif;transition:transform .18s ease,background .18s ease;overflow:hidden}'
    + '.button:hover{background:#5eead4;transform:translateY(-1px)}'
    + '.button:focus{outline:3px solid rgba(45,212,191,.35);outline-offset:3px}'
    + '.icon{display:none;height:100%;width:100%;object-fit:cover}'
    + '.icon.visible{display:block}'
    + '.fallback-icon{height:28px;width:28px;display:block}'
    + '.fallback-icon.hidden{display:none}'
    + '.close-icon{display:none;font:700 18px/1 Inter,ui-sans-serif,system-ui,sans-serif}'
    + '.close-icon.visible{display:block}'
    + '@media (max-width:520px){.panel{right:10px;left:10px;bottom:84px;width:auto;height:min(620px,calc(100vh - 104px));border-radius:16px}.button{right:16px;bottom:16px}}'
    + '</style>'
    + '<div class="panel" id="panel" aria-hidden="true">'
    + '<iframe class="frame" id="frame" title="Chatbot" src="' + chatUrl + '"></iframe>'
    + '</div>'
    + '<button class="button" id="button" type="button" aria-expanded="false" aria-controls="panel" aria-label="Open chat">'
    + '<img class="icon" id="icon" alt="" />'
    + '<svg class="fallback-icon" id="fallbackIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M21 11.5a8.5 8.5 0 0 1-9.88 8.4L5 21l1.1-4.18A8.5 8.5 0 1 1 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
    + '<path d="M8 11h8M8 14h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    + '</svg>'
    + '<span class="close-icon" id="closeIcon">x</span>'
    + '</button>';

  var panel = shadow.getElementById("panel");
  var button = shadow.getElementById("button");
  var icon = shadow.getElementById("icon");
  var fallbackIcon = shadow.getElementById("fallbackIcon");
  var closeIcon = shadow.getElementById("closeIcon");
  var isOpen = false;

  if (iconUrl) {
    icon.src = iconUrl;
    icon.addEventListener("load", function () {
      if (!isOpen) {
        icon.classList.add("visible");
        fallbackIcon.classList.add("hidden");
      }
    });
    icon.addEventListener("error", function () {
      icon.classList.remove("visible");
      fallbackIcon.classList.remove("hidden");
    });
  }

  function setOpen(nextOpen) {
    isOpen = nextOpen;
    panel.classList.toggle("open", isOpen);
    panel.setAttribute("aria-hidden", String(!isOpen));
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close chat" : "Open chat");

    if (isOpen) {
      icon.classList.remove("visible");
      fallbackIcon.classList.add("hidden");
      closeIcon.classList.add("visible");
      return;
    }

    closeIcon.classList.remove("visible");
    if (icon.complete && icon.naturalWidth > 0) {
      icon.classList.add("visible");
      fallbackIcon.classList.add("hidden");
      return;
    }

    fallbackIcon.classList.remove("hidden");
  }

  button.addEventListener("click", function () {
    setOpen(!isOpen);
  });
})();
`;
}

export async function GET() {
  const settings = await getAdminSettings();

  return new Response(createWidgetScript(settings.widgetBubbleIconUrl), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}
