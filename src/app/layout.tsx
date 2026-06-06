import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sakura — Where I Found My Spring',
  description: 'A living digital sanctuary for two.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
