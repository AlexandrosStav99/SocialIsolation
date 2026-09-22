import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalkPoint | University prototype",
  description:
    "A university demonstration of planned support navigation for young adults. Not an operational support or emergency service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}