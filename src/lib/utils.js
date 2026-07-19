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
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export function getStatusLabel(status) {
  const labels = {
    pendente: 'Aguardando pagamento',
    confirmado: 'Pagamento confirmado',
    preparando: 'Em preparo',
    pronto: 'Pronto para retirada',
    saiu_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  }
  return labels[status] || status
}

export function getStatusColor(status) {
  const colors = {
    pendente: '#F59E0B',
    confirmado: '#3B82F6',
    preparando: '#A78BFA',
    pronto: '#10B981',
    saiu_entrega: '#EF4444',
    entregue: '#059669',
    cancelado: '#6B7280'
  }
  return colors[status] || '#9CA3AF'
}

export function gerarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}