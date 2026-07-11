import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "My Daily Affirmations",
  description:
    "A focused morning ritual — one positive intention a day. Replace negative self-talk with purpose.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border py-8 text-center text-sm text-muted">
          <p>My Daily Affirmations · A calm start to every morning.</p>
        </footer>
      </body>
    </html>
  );
}
