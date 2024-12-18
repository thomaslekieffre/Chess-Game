import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "ChessGame",
  description: "ChessGame is a chess game platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/80",
          card: "bg-background",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "text-foreground border-border bg-background hover:bg-muted",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background text-foreground border-border",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
          footerActionText: "text-muted-foreground",
        },
      }}
    >
      <html lang="fr" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
