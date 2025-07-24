import type { Metadata } from "next";
import "../globals.css";
import { Poppins } from "next/font/google";
import Navbar from "@/components/navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fitly | Fits Perfectly",
  description: "Fashion made for you",
  icons: {
    icon: "./favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <meta name="google-site-verification" content="ph9JaxRAo7iBw0NVOw4W_JGmnE6vTcdmJqU7-BubFUY" />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}