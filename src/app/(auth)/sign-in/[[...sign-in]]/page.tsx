import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#F5F4EF" }}
    >
      <div className="mb-8 text-center">
        <h1
          className="text-3xl tracking-tight"
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            color: "#1A1A1A",
          }}
        >
          Quiet Dissent
        </h1>
        <p
          className="mt-1 text-sm"
          style={{
            fontFamily: "var(--font-dm-mono), monospace",
            color: "#7A7875",
          }}
        >
          Client Portal
        </p>
      </div>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#5F8575",
            colorBackground: "#EDECEA",
            colorInputBackground: "#F5F4EF",
            colorInputText: "#1A1A1A",
            colorText: "#1A1A1A",
            colorTextSecondary: "#4A4A4A",
            borderRadius: "6px",
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
          },
          elements: {
            card: "shadow-none border",
            rootBox: "w-full max-w-sm",
            socialButtonsBlockButton__apple: { display: "none" },
            socialButtonsIconButton__apple: { display: "none" },
          },
        }}
      />
    </div>
  );
}
