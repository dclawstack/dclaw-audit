import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AICopilotSidebar from "@/components/AICopilotSidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DClaw Audit",
  description: "AI-native audit engagement, evidence, and remediation workspace.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <AICopilotSidebar />
      </body>
    </html>
  )
}
