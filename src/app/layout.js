import "./globals.css"
import { AuthProvider } from './context/AuthContext'
import { CarrinhoProvider } from './context/CarrinhoContext'
import CarrinhoSidebar from '../components/CarrinhoSidebar'
import RippleProvider from '../components/RippleProvider'
import { storeConfig } from '@/config/store'

export const metadata = {
  title: storeConfig.meta.title,
  description: storeConfig.meta.description,
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <CarrinhoProvider>
            <RippleProvider>
              {children}
            </RippleProvider>
            <CarrinhoSidebar />
          </CarrinhoProvider>
        </AuthProvider>
      </body>
    </html>
  )
}