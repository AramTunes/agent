import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SessionProvider } from "@/lib/session";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title: "ایجنت — دستیار کسب‌وکار" },
      { name: "description", content: "ایجنت کار کسب‌وکار را آنلاین می‌کند: صفحه، نوبت، سفارش، منو، محصول و خدمات." },
      { name: "theme-color", content: "#0e6b54" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="fa" dir="rtl" className="antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var s=localStorage.getItem("agent.theme")||localStorage.getItem("nobat.theme");var t=s==="light"||s==="dark"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();document.addEventListener("gesturestart",function(e){e.preventDefault()},{passive:false});document.addEventListener("gesturechange",function(e){e.preventDefault()},{passive:false});document.addEventListener("touchmove",function(e){if(e.touches&&e.touches.length>1)e.preventDefault()},{passive:false});document.addEventListener("wheel",function(e){if(e.ctrlKey)e.preventDefault()},{passive:false});document.addEventListener("keydown",function(e){if((e.ctrlKey||e.metaKey)&&(e.key==="+"||e.key==="-"||e.key==="="||e.key==="0"))e.preventDefault()});',
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <ThemeProvider>
          <AuthProvider>
            <SessionProvider>
              <Outlet />
              <Toaster
              position="top-center"
              dir="rtl"
              toastOptions={{
                style: {
                  background: "var(--color-card)",
                  color: "var(--color-ink)",
                  border: "1px solid var(--color-line)",
                  fontFamily: "inherit",
                },
              }}
              />
            </SessionProvider>
          </AuthProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  ),
});
