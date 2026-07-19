'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useCarrinho } from './context/CarrinhoContext'
import HeaderUnificado from '../components/HeaderUnificado'
import ProductCard from '../components/ProductCard'
import Toast from '../components/Toast'
import { storeConfig } from '@/config/store'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans
const { identidade, contato, meta } = storeConfig

export default function HomePage() {
  const { adicionarItem } = useCarrinho()
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [adicionandoId, setAdicionandoId] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)

  const sobreRef = useRef(null)

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await supabase
          .from('products')
          .select('id, nome, descricao, peso_volume, preco, imagem_url, categoria')
          .eq('ativo', true)
          .limit(6)
        setProdutos(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function handleAdicionar(produto) {
    adicionarItem({
      product_id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem_url: produto.imagem_url,
      quantidade: 1
    })
    setFeedback(`${produto.nome} adicionado ao carrinho!`)
    setAdicionandoId(produto.id)
    setTimeout(() => { setAdicionandoId(null) }, 1500)
    setTimeout(() => { setFeedback(null) }, 2000)
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: SANS }}>
      <HeaderUnificado />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <video
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(45,52,54,0.7) 0%, rgba(45,52,54,0.4) 100%)'
          }} />
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          padding: '120px 24px 100px', textAlign: 'center'
        }}>
          <h1 style={{
            fontFamily: SERIF, fontSize: 'clamp(36px, 6vw, 60px)',
            color: COLORS.white, fontWeight: 700,
            margin: '0 0 16px 0', letterSpacing: '-1px',
            textShadow: '0 2px 20px rgba(0,0,0,0.3)'
          }}>
            {identidade.name}
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'rgba(255,255,255,0.9)',
            margin: '0 0 36px 0', maxWidth: '520px',
            marginLeft: 'auto', marginRight: 'auto',
            lineHeight: 1.6
          }}>
            {identidade.tagline}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/cardapio" style={{
              padding: '16px 36px', borderRadius: '999px', border: 'none',
              background: theme.gradients.coral,
              color: COLORS.white, fontSize: '15px', fontWeight: 700,
              fontFamily: SANS, cursor: 'pointer', textDecoration: 'none',
              boxShadow: theme.shadows.button,
              transition: 'all 0.2s'
            }}>
              Ver cardapio
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: SERIF, fontSize: '32px', color: COLORS.dark,
            fontWeight: 700, margin: '0 0 8px 0', textAlign: 'center'
          }}>
            Em Destaque
          </h2>
          <p style={{
            fontSize: '15px', color: COLORS.textSecondary,
            textAlign: 'center', margin: '0 0 48px 0', lineHeight: 1.6
          }}>
            Nossos produtos mais pedidos
          </p>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textSecondary }}>
              Carregando...
            </div>
          ) : produtos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textSecondary }}>
              Nenhum produto disponivel no momento.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {produtos.map(produto => (
                <ProductCard
                  key={produto.id}
                  produto={produto}
                  adicionandoId={adicionandoId}
                  hoveredCard={hoveredCard}
                  setHoveredCard={setHoveredCard}
                  handleAdicionar={handleAdicionar}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/cardapio" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 32px', borderRadius: '999px',
              border: '1.5px solid ' + COLORS.coral,
              background: 'transparent', color: COLORS.coral,
              fontSize: '14px', fontWeight: 700, fontFamily: SANS,
              cursor: 'pointer', textDecoration: 'none',
              transition: 'all 0.2s'
            }}>
              Ver cardapio completo
            </Link>
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section ref={sobreRef} style={{
        position: 'relative', overflow: 'hidden',
        background: theme.gradients.dark,
        padding: '80px 24px'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 50%, rgba(0,206,201,0.08) 0%, transparent 60%)'
        }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '700px', margin: '0 auto', textAlign: 'center'
        }}>
          <h2 style={{
            fontFamily: SERIF, fontSize: '32px', color: COLORS.white,
            fontWeight: 700, margin: '0 0 24px 0'
          }}>
            Sobre Nos
          </h2>
          <p style={{ color: COLORS.textOnDark, fontSize: '15px', lineHeight: 1.8, margin: '0 0 16px 0', opacity: 0.9 }}>
            Sua marca, sua historia. Edite este texto em <code style={{ color: COLORS.turquoise }}>src/app/page.js</code> para contar sua historia, seus valores e o que torna seu produto especial.
          </p>
          <p style={{ color: COLORS.textOnDark, fontSize: '15px', lineHeight: 1.8, margin: '0 0 16px 0', opacity: 0.9 }}>
            Cada ingrediente e escolhido com cuidado. Cada produto passa pelo controle de qualidade. O carinho de antes continua do mesmo tamanho -- a diferenca e que agora a gente compartilha com voce.
          </p>
          <p style={{ margin: 0, fontStyle: 'italic', color: COLORS.turquoise, fontSize: '15px' }}>
            {identidade.subtitle}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: COLORS.dark, padding: '60px 24px 40px',
        borderTop: '1px solid rgba(0,206,201,0.15)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px', marginBottom: '40px'
          }}>
            <div>
              <h4 style={{ fontFamily: SERIF, fontSize: '16px', color: COLORS.turquoise, fontWeight: 700, margin: '0 0 12px 0' }}>
                {identidade.name}
              </h4>
              <p style={{ color: COLORS.textOnDark, fontSize: '13px', lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                {identidade.subtitle}. {meta.description}
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: SERIF, fontSize: '16px', color: COLORS.turquoise, fontWeight: 700, margin: '0 0 12px 0' }}>
                Contato
              </h4>
              <p style={{ color: COLORS.textOnDark, fontSize: '13px', lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                {contato.email}<br />
                {contato.phone || contato.telefone}<br />
                {contato.instagram}
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: SERIF, fontSize: '16px', color: COLORS.turquoise, fontWeight: 700, margin: '0 0 12px 0' }}>
                Horarios
              </h4>
              <p style={{ color: COLORS.textOnDark, fontSize: '13px', lineHeight: 1.7, opacity: 0.7, margin: 0 }}>
                Seg a Sex: 09h as 18h30<br />
                Sab: 09h as 13h
              </p>
            </div>
          </div>
          <div style={{
            marginTop: '40px', paddingTop: '24px',
            borderTop: '1px solid rgba(0,206,201,0.25)',
            textAlign: 'center', color: COLORS.textOnDark,
            fontSize: '13px', opacity: 0.6
          }}>
            {identidade.name}. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* TOAST */}
      <Toast mensagem={feedback} />
    </div>
  )
}