'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrinho } from '../context/CarrinhoContext'
import { supabase } from '@/lib/supabaseClient'
import Header from '../../components/Header'
import useAnimacaoScroll from '../../hooks/useAnimacaoScroll'

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

function CardProduto({ produto, adicionandoId, hoveredCard, setHoveredCard, handleAdicionar }) {
  const [ref, visivel] = useAnimacaoScroll({ threshold: 0.1 })

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHoveredCard(produto.id)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{
        background: COLORS.white,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid ' + COLORS.border,
        boxShadow: hoveredCard === produto.id
          ? '0 16px 40px rgba(45,27,14,0.12)'
          : '0 4px 12px rgba(45,27,14,0.06)',
        transform: hoveredCard === produto.id
          ? 'translateY(-6px)'
          : visivel ? 'translateY(0)' : 'translateY(30px)',
        opacity: visivel ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
    >
      {/* Imagem */}
      <div style={{
        overflow: 'hidden',
        height: '200px',
        background: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {produto.imagem_url ? (
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
              transform: hoveredCard === produto.id ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          <span style={{ color: COLORS.textSecondary, fontSize: '13px' }}>Foto em breve</span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{
            fontFamily: SERIF,
            fontSize: '18px',
            color: COLORS.dark,
            fontWeight: 700,
            margin: 0
          }}>
            {produto.nome}
          </h3>
          {produto.peso_volume && (
            <span style={{
              fontSize: '12px',
              color: COLORS.textSecondary,
              whiteSpace: 'nowrap',
              marginLeft: '8px',
              marginTop: '4px'
            }}>
              {produto.peso_volume}
            </span>
          )}
        </div>

        {produto.categoria && (
          <span style={{
            display: 'inline-block',
            alignSelf: 'flex-start',
            padding: '2px 10px',
            borderRadius: '999px',
            background: COLORS.bg,
            color: COLORS.textSecondary,
            fontSize: '11px',
            fontWeight: 600
          }}>
            {produto.categoria}
          </span>
        )}

        {produto.descricao && (
          <p style={{
            fontSize: '13px',
            color: COLORS.textSecondary,
            lineHeight: 1.5,
            margin: 0,
            flex: 1
          }}>
            {produto.descricao}
          </p>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '12px'
        }}>
          <span style={{
            fontFamily: SERIF,
            fontSize: '22px',
            color: COLORS.gold,
            fontWeight: 700
          }}>
            R$ {Number(produto.preco).toFixed(2)}
          </span>
          <button
            onClick={() => handleAdicionar(produto)}
            disabled={adicionandoId === produto.id}
            style={{
              background: adicionandoId === produto.id ? '#4CAF50' : COLORS.gold,
              color: COLORS.white,
              border: 'none',
              borderRadius: '999px',
              padding: '10px 20px',
              cursor: adicionandoId === produto.id ? 'default' : 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: SANS,
              transition: 'all 0.3s ease'
            }}
          >
            {adicionandoId === produto.id ? 'Adicionado' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CardapioPage() {
  const router = useRouter()
  const { adicionarItem } = useCarrinho()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState(['Todas', 'Cremosas', 'Frutadas', 'Especiais'])
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas')
  const [carregando, setCarregando] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [adicionandoId, setAdicionandoId] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const produtosRef = useRef(null)

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('ativo', true)

        if (error) {
          console.error('Erro ao buscar produtos:', error)
          setProdutos([])
          return
        }

        setProdutos(data || [])

        if (data && data.length > 0 && data.some(p => p.categoria)) {
          const uniqueCategorias = [
            'Todas',
            ...Array.from(
              new Set(data.map(p => p.categoria).filter(Boolean))
            )
          ]
          setCategorias(uniqueCategorias)
        } else {
          setCategorias(['Todas'])
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar produtos:', err)
        setProdutos([])
        setCategorias(['Todas'])
      } finally {
        setCarregando(false)
      }
    }

    fetchProdutos()
  }, [])

  const filteredProdutos = categoriaAtiva === 'Todas'
    ? produtos
    : produtos.filter(p => p.categoria === categoriaAtiva)

  function handleAdicionar(produto) {
    adicionarItem({
      product_id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      imagem_url: produto.imagem_url,
      quantidade: 1
    })
    setFeedback(`${produto.nome} adicionado ao carrinho!`)
    setAdicionandoId(produto.id)
    setTimeout(() => { setAdicionandoId(null) }, 1500)
    setTimeout(() => { setFeedback(null) }, 2000)
  }

  function handleCategoriaChange(cat) {
    setCategoriaAtiva(cat)
    if (produtosRef.current) {
      produtosRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: SANS }}>
      <Header />

      {/* Hero do cardapio */}
      <div style={{
        background: COLORS.dark,
        padding: '80px 24px 60px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(196,151,90,0.12) 0%, transparent 70%)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="animar-fade-up animar-atraso-1" style={{
            fontFamily: SERIF,
            fontSize: '42px',
            color: COLORS.white,
            fontWeight: 700,
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px'
          }}>
            Cardapio Gourmet
          </h1>
          <p className="animar-fade-up animar-atraso-2" style={{
            fontSize: '16px',
            color: COLORS.textOnDark,
            opacity: 0.8,
            margin: 0,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Cada fatia feita à mão com ingredientes selecionados e o carinho de sempre.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }} ref={produtosRef}>
        {/* Filtros por categoria */}
        <div className="animar-fade-up animar-atraso-3" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          padding: '32px 0'
        }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoriaChange(cat)}
              style={{
                padding: '10px 24px',
                borderRadius: '999px',
                border: 'none',
                background: categoriaAtiva === cat ? COLORS.gold : 'transparent',
                color: categoriaAtiva === cat ? COLORS.white : COLORS.textSecondary,
                border: categoriaAtiva === cat ? 'none' : '1px solid ' + COLORS.border,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: SANS,
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {carregando ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            color: COLORS.textSecondary,
            fontSize: '15px'
          }}>
            Carregando...
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 0',
            color: COLORS.textSecondary,
            fontSize: '15px'
          }}>
            Nenhum produto nesta categoria.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '28px',
            paddingBottom: '80px'
          }}>
            {filteredProdutos.map((produto, index) => (
              <CardProduto
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
      </div>

      {/* Toast feedback */}
      {feedback && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: COLORS.dark,
          color: COLORS.textOnDark,
          padding: '14px 28px',
          borderRadius: '999px',
          border: '1px solid ' + COLORS.gold,
          fontSize: '14px',
          fontWeight: 600,
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(45,27,14,0.25)'
        }}>
          {feedback}
        </div>
      )}
    </div>
  )
}
