import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { isClerkConfigured } from "@/lib/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Verdana — The social network for saving the planet",
    template: "%s · Verdana",
  },
  description:
    "Verdana is the world's largest environmental social network. Build your living Earth through real-world action, climb the global leaderboard, and restore the planet together.",
  keywords: [
    "climate",
    "reforestation",
    "social network",
    "gamified sustainability",
    "eco community",
    "living earth",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );

  // Wrap with Clerk only when configured, so the app still runs in demo mode.
  return isClerkConfigured ? (
    <ClerkProvider signInUrl="/login" signUpUrl="/signup">
      {content}
    </ClerkProvider>
  ) : (
    content
  );
}
