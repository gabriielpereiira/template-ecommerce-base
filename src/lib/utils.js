// src/lib/utils.js
// Utilitarios centralizados do template

import { storeConfig } from '@/config/store'

export function formatarPreco(valor) {
  if (valor == null) return 'R$ 0,00'
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
}

export function formatarData(dataISO) {
  if (!dataISO) return ''
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  const horas = String(data.getHours()).padStart(2, '0')
  const minutos = String(data.getMinutes()).padStart(2, '0')
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`
}

export function formatarDataCurta(dataISO) {
  if (!dataISO) return ''
  const data = new Date(dataISO)
  const dia = String(data.getDate()).padStart(2, '0')
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const ano = data.getFullYear()
  return `${dia}/${mes}/${ano}`
}

export function formatarTelefone(valor) {
  if (!valor) return ''
  const d = String(valor).replace(/\D/g, '')
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

export function mascaraTelefone(valor) {
  const d = String(valor).replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function getStatusLabel(status) {
  const labels = {
    pendente: 'Aguardando pagamento',
    confirmado: 'Pagamento confirmado',
    preparando: 'Em preparo',
    pronto: 'Pronto para retirada',
    sai_entrega: 'Saiu para entrega',
    saiu_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  }
  if (storeConfig?.pedido?.orderStatuses?.includes(status)) {
    return labels[status] || status
  }
  return labels[status] || status
}

export function getStatusColor(status) {
  const c = {
    gold: '#C4975A', success: '#4CAF50', warning: '#FF9800',
    danger: '#c00', textSecondary: '#6B4F3A'
  }
  const colors = {
    pendente: '#FF9800',
    confirmado: c.gold,
    preparando: '#2196F3',
    pronto: '#9C27B0',
    sai_entrega: '#FF9800',
    saiu_entrega: '#FF9800',
    entregue: '#4CAF50',
    cancelado: '#c00'
  }
  return colors[status] || c.textSecondary
}

export function formatarEndereco(endereco) {
  if (!endereco) return null
  if (typeof endereco === 'string') return endereco
  try {
    if (typeof endereco === 'object') {
      const parts = [
        endereco.logradouro, endereco.numero,
        endereco.bairro, endereco.cidade, endereco.estado
      ].filter(Boolean)
      return parts.join(', ')
    }
  } catch {}
  return String(endereco)
}