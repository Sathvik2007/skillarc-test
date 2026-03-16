import "./globals.css"

export const metadata = {
  title: "SkillArc LMS",
  description: "Learning Management System",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}