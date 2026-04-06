"use client";
import { useEffect } from "react";

export default function CalEmbed() {
  const calLink =
    process.env.NEXT_PUBLIC_CAL_URL?.replace("https://cal.com/", "") ?? "quiet-dissent";

  useEffect(() => {
    (function (C: any, A: string, L: string) {
      let p = function (a: any, ar: any) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function (...args: any[]) {
        let cal = C.Cal;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          let s = d.createElement("script");
          s.src = A;
          d.head.appendChild(s);
          cal.loaded = true;
        }
        if (args[0] === L) {
          const api = function (...a: any[]) { p(api, a); };
          api.q = [] as any[];
          cal.ns[args[1]] = api;
          p(cal, ["initNamespace", args[1]]);
          return;
        }
        p(cal, args);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    const Cal = (window as any).Cal;
    Cal("init", { origin: "https://cal.com" });
    Cal("inline", {
      elementOrSelector: "#cal-embed",
      calLink,
      theme: "light",
    });
  }, [calLink]);

  return <div id="cal-embed" style={{ width: "100%", height: "800px" }} />;
}
