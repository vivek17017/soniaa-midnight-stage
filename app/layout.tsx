import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soniaa | Fractional CMO",
  description: "Crafting brands people can feel. Explore Soniaa’s work across brand, demand generation, and team leadership.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
