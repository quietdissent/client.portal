"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  welcomeHtml: string;
  agreementHtml: string;
  agreementDocId: string;
  agreementSigned: boolean;
  clientId: string;
}

export function OnboardingGate({
  welcomeHtml,
  agreementHtml,
  agreementDocId,
  agreementSigned,
  clientId,
}: Props) {
  const welcomeKey = `qd_welcome_seen_${clientId}`;
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"welcome" | "agreement">("welcome");
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(welcomeKey)) {
      setStep("agreement");
    }
    setMounted(true);
  }, [welcomeKey]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "qd-agreement-signed") {
        const { name, company } = event.data as { name?: string; company?: string };
        fetch(`/api/documents/${agreementDocId}/sign`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signer_name: name, signer_company: company }),
        }).then((res) => {
          if (res.ok) setSigned(true);
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [agreementDocId]);

  if (!mounted) return null;
  if (agreementSigned || signed) return null;

  function handleContinue() {
    localStorage.setItem(welcomeKey, "1");
    setStep("agreement");
  }

  const patchedAgreementHtml = agreementHtml.replace('</body>', '<script>document.addEventListener(\'click\',function(e){var a=e.target.closest(\'a[href^="#"]\');if(!a)return;e.preventDefault();var id=a.getAttribute(\'href\').slice(1);var target=document.getElementById(id);if(target)target.scrollIntoView({behavior:\'smooth\'});});<\/script></body>');

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "#F5F4EF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {step === "welcome" ? (
        <>
          <iframe
            srcDoc={welcomeHtml}
            style={{ width: "100%", flex: 1, border: "none" }}
            sandbox="allow-scripts allow-same-origin"
          />
          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#F5F4EF",
              borderTop: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <button
              onClick={handleContinue}
              style={{
                padding: "10px 24px",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Continue to Agreement →
            </button>
          </div>
        </>
      ) : (
        <iframe
          srcDoc={patchedAgreementHtml}
          style={{ width: "100%", height: "100vh", border: "none" }}
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}
