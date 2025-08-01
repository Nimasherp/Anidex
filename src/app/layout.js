
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProviderWrapper } from "../components/SessionProviderWrapper"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'anidex',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
