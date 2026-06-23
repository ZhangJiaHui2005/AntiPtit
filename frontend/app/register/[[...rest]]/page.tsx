"use client";

import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <SignUp
        routing="path"
        path="/register"
        appearance={{
          variables: {
            colorPrimary: "#b91c1c",
            colorDanger: "#dc2626",
            colorBackground: "#fafafa",
            borderRadius: "0.5rem",
          },
          elements: {
            formButtonPrimary:
              "bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded transition-colors",
            formButtonSecondary:
              "bg-zinc-200 hover:bg-zinc-300 text-zinc-900 font-medium py-2 px-4 rounded transition-colors",
            button:
              "bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded transition-colors",
            card: "shadow-lg border border-zinc-200 rounded-lg bg-white",
            headerTitle: "text-zinc-900 font-bold text-2xl",
            headerSubtitle: "text-zinc-600 text-sm",
            formFieldInput:
              "border border-zinc-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700",
            formFieldLabel: "text-zinc-700 font-medium text-sm",
            footerActionLink: "text-red-700 hover:text-red-800 font-medium",
            dividerRow: "bg-zinc-100",
            formResendCodeLink: "text-red-700 hover:text-red-800 font-medium",
          },
        }}
      />
    </div>
  );
}
