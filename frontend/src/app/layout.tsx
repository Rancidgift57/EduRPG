import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduRPG — Learn. Battle. Level Up.",
  description: "Gamified learning platform where you defeat monsters by answering questions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}