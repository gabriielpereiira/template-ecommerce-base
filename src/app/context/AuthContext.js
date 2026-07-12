'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarPerfil(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (data) {
        // Perfil encontrado no banco
        setPerfil(data)
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          nome: data.nome,
          email: data.email
        }))
        setCarregando(false)
        return
      }

      // Se chegou aqui, nao tem perfil no banco
      // Verifica se tem dados pendentes salvos durante o cadastro
      const dadosPendentes = localStorage.getItem('dadosPerfilPendentes')
      if (dadosPendentes) {
        try {
          const parsed = JSON.parse(dadosPendentes)
          if (parsed.id === userId) {
            // Tenta salvar no banco agora que o usuario esta autenticado
            const { data: perfilSalvo, error: erroSalvar } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                nome: parsed.nome || '',
                telefone: parsed.telefone || '',
                cep: parsed.cep || '',
                logradouro: parsed.logradouro || '',
                numero: parsed.numero || '',
                complemento: parsed.complemento || '',
                bairro: parsed.bairro || '',
                cidade: parsed.cidade || '',
                estado: parsed.estado || '',
                updated_at: new Date().toISOString()
              })
              .select()
              .single()

            if (!erroSalvar && perfilSalvo) {
              setPerfil(perfilSalvo)
              localStorage.removeItem('dadosPerfilPendentes')
              localStorage.setItem('user', JSON.stringify({
                id: perfilSalvo.id,
                nome: perfilSalvo.nome,
                email: perfilSalvo.email
              }))
              setCarregando(false)
              return
            }

            // Se o upsert falhou, usa os dados do localStorage mesmo
            setPerfil(parsed)
            setCarregando(false)
            return
          }
        } catch (e) {
          // Dados corrompidos, limpa
          localStorage.removeItem('dadosPerfilPendentes')
        }
      }

      // Sem dados em lugar nenhum - salva basico do auth
      const session = (await supabase.auth.getSession()).data.session
      if (session?.user) {
        localStorage.setItem('user', JSON.stringify({
          id: session.user.id,
          email: session.user.email
        }))
      }
      setCarregando(false)
    } catch (err) {
      console.error('[AuthContext] Erro ao carregar perfil:', err)
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
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: senha })
      if (error) return { data: null, error: { message: error.message } }
      return { data, error: null }
    } catch (err) {
      return { data: null, error: { message: err.message || 'Erro ao criar conta' } }
    }
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
    <AuthContext.Provider value={{
      usuario, perfil, carregando, cadastrar, login, logout, atualizarPerfil
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}