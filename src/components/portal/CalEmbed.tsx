"use client";

import { useEffect } from "react";

export default function CalEmbed() {
  const calLink =
    process.env.NEXT_PUBLIC_CAL_URL?.replace("https://cal.com/", "") ?? "quiet-dissent";

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      const Cal = (window as unknown as { Cal?: Function }).Cal;
      if (!Cal) return;
      Cal("init", { origin: "https://cal.com" });
      Cal("inline", {
        elementOrSelector: "#cal-embed",
        calLink,
        theme: "light",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [calLink]);

  return <div id="cal-embed" style={{ width: "100%", height: "600px" }} />;
}
