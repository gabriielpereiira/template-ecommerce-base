'use client'
import { theme } from '@/theme'

const COLORS = theme.colors
const SANS = theme.fonts.sans
const SERIF = theme.fonts.serif

export default function ProductCard({ produto, adicionandoId, hoveredCard, setHoveredCard, handleAdicionar }) {
  return (
    <div
      onMouseEnter={() => setHoveredCard(produto.id)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{
        background: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${hoveredCard === produto.id ? COLORS.coral : COLORS.border}`,
        boxShadow: hoveredCard === produto.id
          ? '0 8px 30px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: hoveredCard === produto.id ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer'
      }}
    >
      {/* Imagem */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '200px',
        background: COLORS.bg,
        overflow: 'hidden'
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
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: COLORS.textLight, fontSize: '13px', fontFamily: SANS
          }}>
            Sem imagem
          </div>
        )}
        {produto.categoria && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.9)',
            color: COLORS.dark, fontSize: '11px', fontWeight: 700,
            fontFamily: SANS, backdropFilter: 'blur(4px)'
          }}>
            {produto.categoria}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '20px 20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: SERIF, fontSize: '18px', color: COLORS.dark,
          fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.3
        }}>
          {produto.nome}
        </h3>

        {produto.descricao && (
          <p style={{
            fontFamily: SANS, fontSize: '13px', color: COLORS.textSecondary,
            margin: '0 0 12px 0', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {produto.descricao}
          </p>
        )}

        {produto.peso_volume && (
          <p style={{
            fontFamily: SANS, fontSize: '12px', color: COLORS.textLight,
            margin: '0 0 12px 0'
          }}>
            {produto.peso_volume}
          </p>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: SERIF, fontSize: '22px', fontWeight: 700,
            color: COLORS.dark
          }}>
            {typeof produto.preco === 'number'
              ? `R$ ${produto.preco.toFixed(2).replace('.', ',')}`
              : produto.preco}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAdicionar(produto)
            }}
            disabled={adicionandoId === produto.id}
            style={{
              padding: '10px 20px',
              borderRadius: 999,
              border: 'none',
              background: adicionandoId === produto.id ? COLORS.turquoise : `linear-gradient(135deg, ${COLORS.coral} 0%, #E55A5A 100%)`,
              color: COLORS.white,
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: SANS,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: adicionandoId === produto.id ? 'none' : '0 2px 8px rgba(255,107,107,0.3)',
              opacity: adicionandoId === produto.id ? 0.8 : 1
            }}
          >
            {adicionandoId === produto.id ? 'Adicionado!' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}