import type { Metadata } from "next"
import "./globals.css"
import AICopilotSidebar from "@/components/AICopilotSidebar"

export const metadata: Metadata = {
  title: "DClaw Audit — AI-Native Audit Platform",
  description:
    "The evidence-to-finding operating system for internal audit teams. AI-assisted evidence collection, control testing, remediation, anomaly detection, and reporting.",
  openGraph: {
    title: "DClaw Audit — AI-Native Audit Platform",
    description:
      "Compress audit cycle time without adding headcount. AI copilot, evidence management, finding lifecycle, workpapers, anomaly detection, and board-ready reporting.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AICopilotSidebar />
      </body>
    </html>
  )
}
