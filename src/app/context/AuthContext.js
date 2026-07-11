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

      if (data) setPerfil(data)
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

  async function cadastrar(email, senha) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    return { data, error }
  }

  async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    return { data, error }
  }

  async function logout() {
    setPerfil(null)
    setUsuario(null)
    localStorage.removeItem('user')
    await supabase.auth.signOut()
  }

  async function atualizarPerfil(dados) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: usuario.id, ...dados, updated_at: new Date().toISOString() })

      if (error) throw error

      setPerfil(prev => ({ ...prev, ...dados }))
      return { success: true }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      return { success: false, error: err.message }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        carregando,
        cadastrar,
        login,
        logout,
        atualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}