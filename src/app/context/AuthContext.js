'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarPerfil(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (data) {
        setPerfil(data)
        localStorage.setItem('user', JSON.stringify({ id: data.id, nome: data.nome, email: data.email }))
      } else {
        const session = (await supabase.auth.getSession()).data.session
        if (session?.user) {
          localStorage.setItem('user', JSON.stringify({ id: session.user.id, email: session.user.email }))
        }
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        carregarPerfil(user.id)
      } else {
        setCarregando(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null
      setUsuario(user)
      if (user) {
        carregarPerfil(user.id)
      } else {
        setPerfil(null)
        localStorage.removeItem('user')
        setCarregando(false)
      }
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  async function atualizarPerfil(dados) {
    if (!usuario) return { error: 'Usuario nao logado' }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: usuario.id, ...dados, updated_at: new Date().toISOString() })
        .select()
        .single()

      if (error) return { error: error.message }
      if (data) setPerfil(data)
      return { data }
    } catch (err) {
      return { error: err.message }
    }
  }

  async function cadastrar(email, senha) {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    return { data, error }
  }

  async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return { data, error }
  }

  async function logout() {
    setPerfil(null)
    setUsuario(null)
    localStorage.removeItem('user')
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ usuario, perfil, carregando, cadastrar, login, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}