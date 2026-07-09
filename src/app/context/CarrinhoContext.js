'use client'

import { createContext, useContext, useState } from 'react'

const CarrinhoContext = createContext()

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([])
  const [aberto, setAberto] = useState(false)

  function adicionarItem(produto) {
    setItens(prev => {
      const existente = prev.find(i => i.product_id === produto.product_id)
      if (existente) {
        return prev.map(i =>
          i.product_id === produto.product_id
            ? { ...i, quantidade: i.quantidade + 1 }
            : i
        )
      }
      return [
        ...prev,
        {
          product_id: produto.product_id,
          nome: produto.nome,
          preco: Number(produto.preco),
          quantidade: 1,
        },
      ]
    })
    setAberto(true)
  }

  function removerItem(productId) {
    setItens(prev =>
      prev
        .map(i =>
          i.product_id === productId
            ? { ...i, quantidade: i.quantidade - 1 }
            : i
        )
        .filter(i => i.quantidade > 0)
    )
  }

  function limparCarrinho() {
    setItens([])
  }

  const subtotal = itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0)
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        aberto,
        setAberto,
        adicionarItem,
        removerItem,
        limparCarrinho,
        subtotal,
        totalItens,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  return useContext(CarrinhoContext)
}