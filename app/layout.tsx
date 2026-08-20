import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PaletteProvider } from "@/components/providers/palette-provider";
import { createTranslator } from "@/lib/i18n";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale-cookie";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext", "cyrillic"] as ("latin" | "latin-ext")[],
  weight: ["400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const t = createTranslator(locale);

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return (
    <html
      lang={locale === "en" ? "en" : "ru"}
      suppressHydrationWarning
      data-palette="coral"
      className={`${dmSans.variable} ${cormorant.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark"]}
          storageKey="creator-theme"
          disableTransitionOnChange
        >
          <PaletteProvider>
            {children}
            <Toaster />
          </PaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
