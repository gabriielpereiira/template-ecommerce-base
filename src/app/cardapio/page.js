'use client'
import { useEffect, useState, useRef } from 'react'
import { useCarrinho } from '../context/CarrinhoContext'
import { supabase } from '@/lib/supabaseClient'
import HeaderUnificado from '../../components/HeaderUnificado'
import ProductCard from '../../components/ProductCard'
import Toast from '../../components/Toast'
import { theme } from '@/theme'

const COLORS = theme.colors
const SERIF = theme.fonts.serif
const SANS = theme.fonts.sans

export default function CardapioPage() {
  const { adicionarItem } = useCarrinho()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState(['Todas'])
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
      <HeaderUnificado />

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
          background: `radial-gradient(ellipse at center, ${COLORS.turquoise}0C 0%, transparent 70%)`
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: SERIF,
            fontSize: '42px',
            color: COLORS.white,
            fontWeight: 700,
            margin: '0 0 12px 0',
            letterSpacing: '-0.5px'
          }}>
            Cardapio
          </h1>
          <p style={{
            fontSize: '16px',
            color: COLORS.textOnDark,
            opacity: 0.8,
            margin: 0,
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Escolha seus produtos favoritos e faça seu pedido
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }} ref={produtosRef}>
        {/* Filtros por categoria */}
        <div style={{
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
                border: categoriaAtiva === cat ? 'none' : `1px solid ${COLORS.border}`,
                background: categoriaAtiva === cat ? COLORS.coral : 'transparent',
                color: categoriaAtiva === cat ? COLORS.white : COLORS.textSecondary,
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
            {filteredProdutos.map(produto => (
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
      </div>

      {/* Toast feedback */}
      <Toast mensagem={feedback} />
    </div>
  )
}