import "./globals.css"
import { AuthProvider } from './context/AuthContext'
import { CarrinhoProvider } from './context/CarrinhoContext'
import CarrinhoSidebar from '../components/CarrinhoSidebar'
import { storeConfig } from '@/config/store'

export const metadata = {
  title: storeConfig.meta.title,
  description: storeConfig.meta.description,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>
          <CarrinhoProvider>
            {children}
            <CarrinhoSidebar />
          </CarrinhoProvider>
        </AuthProvider>
      </body>
    </html>
  )
}