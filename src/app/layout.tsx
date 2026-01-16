import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

import { auth } from "@/auth";
import { UserNav } from "@/components/auth/user-nav";

export const metadata: Metadata = {
  title: "WoW Season Survey",
  description: "Guild Availability and Class Survey",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "antialiased min-h-screen bg-background text-foreground relative")}>
        <UserNav user={session?.user} />
        {children}
      </body>
    </html>
  );
}
