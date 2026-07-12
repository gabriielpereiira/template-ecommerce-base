'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrinho } from './context/CarrinhoContext'
import { useAuth } from './context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import Header from '../components/Header'
import DividerAnimado from '../components/DividerAnimado'

const COLORS = {
  dark: '#2D1B0E',
  gold: '#C4975A',
  bg: '#FAF7F2',
  white: '#FFFFFF',
  textSecondary: '#6B4F3A',
  border: '#E8E0D8',
  textOnDark: '#F0EBE4'
}

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = 'Inter, Arial, sans-serif'

function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

export default function HomePage() {
  const router = useRouter()
  const { adicionarItem } = useCarrinho()
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredBottomCta, setHoveredBottomCta] = useState(false)
  const [feedback, setFeedback] = useState('')
  const produtosRef = useRef(null)
  const sobreRef = useRef(null)
  const cardRefs = useRef([])

  /* ANIMACAO DOS CARDS: observa CADA CARD individualmente e alterna a classe visible */
  useEffect(() => {
    if (!produtos.length) return
    const observers = []
    produtos.forEach((_, index) => {
      const card = cardRefs.current[index]
      if (!card) return
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
            } else {
              entry.target.classList.remove('visible')
            }
          })
        },
        { threshold: 0.15 }
      )
      observer.observe(card)
      observers.push(observer)
    })
    return () => {
      observers.forEach((o) => o.disconnect())
    }
  }, [produtos])

  /* ANIMACAO DA SECAO SOBRE: alterna visible ao entrar/sair da tela */
  useEffect(() => {
    const section = sobreRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          } else {
            entry.target.classList.remove('visible')
          }
        })
      },
      { threshold: 0.2 }
    )
    observer.observe(section)
    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    async function carregar() {
      try {
        const { data } = await supabase
          .from('products')
          .select('id, nome, descricao, peso_volume, preco, imagem_url')
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

  function mostrarFeedback(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 2000)
  }

  function handleAdicionar(produto) {
    adicionarItem({
      product_id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      imagem_url: produto.imagem_url,
      quantidade: 1
    })
    mostrarFeedback('Item adicionado ao carrinho!')
  }

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: SANS, background: COLORS.bg, color: COLORS.dark, minHeight: '100vh', overflowX: 'hidden' }}>
      <Header />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
          animation-delay: 0.2s;
        }
        .hero-text {
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
          animation-delay: 0.5s;
        }
        .hero-btn {
          opacity: 0;
          animation: fadeUp 0.8s ease forwards;
          animation-delay: 0.8s;
        }
        .product-card {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .product-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .product-card:hover {
          border-color: ${COLORS.gold} !important;
        }
        .product-card:hover img {
          transform: scale(1.08);
        }
        .sobre-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .sobre-section.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '90vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(45,27,14,0.75) 0%, rgba(74,48,32,0.6) 50%, rgba(107,79,58,0.5) 100%), url(https://nqjkcqloenliiftcgvro.supabase.co/storage/v1/object/public/produtos/plano%20de%20fundo.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        overflow: 'hidden', padding: '40px 24px'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(196,151,90,0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(196,151,90,0.15) 0%, transparent 45%)',
          opacity: 0.4, pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px' }}>
          <span style={{
            display: 'inline-block', color: COLORS.gold,
            fontSize: '14px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '24px'
          }}>
            Tortas artesanais
          </span>
          <h1 className="hero-title" style={{
            fontFamily: SERIF, fontSize: 'clamp(36px, 6vw, 56px)',
            lineHeight: 1.1, color: COLORS.white,
            margin: '0 0 24px 0', fontWeight: 700
          }}>
            Fatias que contam hist&oacute;rias
          </h1>
          <p className="hero-text" style={{
            fontSize: '18px', lineHeight: 1.6,
            color: COLORS.textOnDark, opacity: 0.85,
            margin: '0 0 40px 0', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto'
          }}>
            Receitas exclusivas preparadas com ingredientes selecionados e o toque artesanal que transforma cada fatia em uma experi&ecirc;ncia memor&aacute;vel.
          </p>
          <div className="hero-btn">
            <button
              onClick={() => router.push('/cardapio')}
              style={{
                padding: '16px 44px', borderRadius: '999px', border: 'none',
                background: COLORS.gold, color: COLORS.white, cursor: 'pointer',
                fontSize: '15px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '2px',
                fontFamily: SANS
              }}
            >Ver Card&aacute;pio</button>
          </div>
        </div>
      </section>

      {/* DIVIDER ANIMADO ENTRE HERO E CARDAPIO */}
      <DividerAnimado />

      {/* PRODUTOS EM DESTAQUE */}
      <section ref={produtosRef} style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 40px)', color: COLORS.dark, margin: '0 0 12px 0', fontWeight: 700 }}>
            Card&aacute;pio Gourmet
          </h2>
          <div style={{ width: '64px', height: '3px', background: COLORS.gold, margin: '0 auto', borderRadius: '2px' }} />
        </div>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textSecondary, fontSize: '16px' }}>
            Carregando produtos...
          </div>
        ) : produtos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textSecondary, fontSize: '16px' }}>
            Nenhum produto dispon&iacute;vel no momento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {produtos.map((produto, index) => (
              <div
                key={produto.id}
                ref={(el) => { cardRefs.current[index] = el }}
                className="product-card"
                onMouseEnter={() => setHoveredCard(produto.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  background: COLORS.white, borderRadius: '16px',
                  display: 'flex', flexDirection: 'column',
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: hoveredCard === produto.id
                    ? '0 16px 40px rgba(45,27,14,0.12)'
                    : '0 4px 12px rgba(45,27,14,0.06)',
                  transform: hoveredCard === produto.id ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  overflow: 'hidden',
                  transitionDelay: '0s'
                }}
              >
                {produto.imagem_url ? (
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                    <img
                      src={produto.imagem_url}
                      alt={produto.nome}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        transition: 'transform 0.4s ease',
                        transform: hoveredCard === produto.id ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    width: '100%', height: '200px',
                    background: COLORS.border,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: COLORS.textSecondary, fontSize: '14px'
                  }}>
                    Foto em breve
                  </div>
                )}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                    <h3 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.dark, margin: 0, fontWeight: 700 }}>
                      {produto.nome}
                    </h3>
                    {produto.peso_volume && (
                      <span style={{
                        border: `1px solid ${COLORS.gold}`, color: COLORS.gold,
                        fontSize: '12px', borderRadius: '999px', padding: '4px 12px',
                        fontFamily: SANS, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600
                      }}>
                        {produto.peso_volume}
                      </span>
                    )}
                  </div>

                  {produto.descricao && (
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: COLORS.textSecondary, margin: '0 0 20px 0', flex: 1 }}>
                      {produto.descricao}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontFamily: SERIF, fontSize: '22px', color: COLORS.dark, fontWeight: 700 }}>
                      {formatarPreco(produto.preco)}
                    </span>
                    <button
                      onClick={() => handleAdicionar(produto)}
                      style={{
                        background: COLORS.gold, color: COLORS.white, border: 'none',
                        borderRadius: '999px', padding: '10px 22px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '1.2px',
                        fontFamily: SANS, transition: 'background 0.2s'
                      }}
                    >Adicionar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button
            onClick={() => router.push('/cardapio')}
            onMouseEnter={() => setHoveredBottomCta(true)}
            onMouseLeave={() => setHoveredBottomCta(false)}
            style={{
              padding: '14px 36px', borderRadius: '999px',
              border: `1px solid ${COLORS.gold}`,
              background: hoveredBottomCta ? COLORS.gold : 'transparent',
              color: hoveredBottomCta ? COLORS.white : COLORS.gold,
              cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1.5px',
              fontFamily: SANS, transition: 'all 0.2s'
            }}
          >Ver card&aacute;pio completo</button>
        </div>
      </section>

      {/* SOBRE — degrade quente #3D2216 → #2D1B0E */}
      <section
        ref={sobreRef}
        className="sobre-section"
        style={{
          background: 'linear-gradient(180deg, #3D2216 0%, #2D1B0E 100%)',
          padding: '100px 24px',
          display: 'flex', justifyContent: 'center'
        }}
      >
        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', color: COLORS.gold,
            fontSize: '12px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px'
          }}>
            Nossa origem
          </span>
          <h2 style={{
            fontFamily: SERIF, fontSize: 'clamp(28px, 4vw, 36px)', lineHeight: 1.2,
            color: COLORS.white, margin: '0 0 24px 0', fontWeight: 700
          }}>
            Tradi&ccedil;&atilde;o que se parte em fatias
          </h2>
          <div style={{ width: '48px', height: '2px', background: COLORS.gold, margin: '0 auto 32px' }} />
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left', fontSize: '15px', lineHeight: 1.8, color: '#CCC' }}>
            <p style={{ margin: '0 0 16px 0' }}>
              Tudo come&ccedil;ou na cozinha da Lika. Uma receita de fam&iacute;lia, um forno que n&atilde;o parava de funcionar e uma filosofia simples: torta boa se faz com paci&ecirc;ncia, manteiga de verdade e as m&atilde;os na massa.
            </p>
            <p style={{ margin: '0 0 16px 0' }}>
              N&atilde;o tinha atalho. N&atilde;o tinha pressa. E at&eacute; hoje a gente faz exatamente assim.
            </p>
            <p style={{ margin: '0 0 16px 0' }}>
              Cada ingrediente &eacute; escolhido um a um. Cada massa espera o ponto certo. O cuidado de antes continua do mesmo tamanho &mdash; a diferen&ccedil;a &eacute; que agora a gente divide cada fatia com voc&ecirc;.
            </p>
            <p style={{ margin: 0, fontStyle: 'italic', color: COLORS.gold }}>
              Tortas da Lika. Confeitaria artesanal onde o carinho ainda &eacute; o ingrediente principal.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER — #2D1B0E */}
      <footer style={{ background: COLORS.dark, padding: '60px 24px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
          <div>
            <h4 style={{ fontFamily: SERIF, fontSize: '20px', color: COLORS.gold, margin: '0 0 12px 0', fontWeight: 700 }}>
              Tortas da Lika
            </h4>
            <p style={{ color: COLORS.textOnDark, fontSize: '14px', lineHeight: 1.7, opacity: 0.8, margin: 0 }}>
              Confeitaria artesanal em Rio Grande/RS. Tortas feitas com receitas de fam&iacute;lia e ingredientes selecionados.
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: SERIF, fontSize: '18px', color: COLORS.gold, margin: '0 0 12px 0', fontWeight: 700 }}>
              Hor&aacute;rios
            </h4>
            <p style={{ color: COLORS.textOnDark, fontSize: '14px', lineHeight: 1.8, opacity: 0.8, margin: 0 }}>
              Seg a S&aacute;b: 8h &agrave;s 19h<br />Dom: 8h &agrave;s 12h
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: SERIF, fontSize: '18px', color: COLORS.gold, margin: '0 0 12px 0', fontWeight: 700 }}>
              Contato
            </h4>
            <p style={{ color: COLORS.textOnDark, fontSize: '14px', lineHeight: 1.8, opacity: 0.8, margin: 0 }}>
              (53) XXXX-XXXX<br />Rio Grande/RS
            </p>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '40px auto 0', paddingTop: '24px', borderTop: '1px solid rgba(196,151,90,0.25)', textAlign: 'center', color: COLORS.textOnDark, fontSize: '13px', opacity: 0.6 }}>
          Tortas da Lika. Todos os direitos reservados.
        </div>
      </footer>

      {/* TOAST */}
      {feedback && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: COLORS.dark, color: COLORS.textOnDark,
          padding: '14px 28px', borderRadius: '999px',
          border: `1px solid ${COLORS.gold}`,
          fontSize: '14px', fontWeight: 600, zIndex: 1000,
          boxShadow: '0 8px 24px rgba(45,27,14,0.25)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  )
}