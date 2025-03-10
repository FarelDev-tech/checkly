import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Checkly!',
  description: 'Manager your todos',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./images/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
