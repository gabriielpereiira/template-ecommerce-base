'use client'

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'

export default function LoginPage() {
const { login, usuario } = useAuth()
const router = useRouter()
const [email, setEmail] = useState('')
const [senha, setSenha] = useState('')
const [erro, setErro] = useState('')
const [enviando, setEnviando] = useState(false)

// Estado do modal de esqueceu a senha
const [modalResetAberto, setModalResetAberto] = useState(false)
const [emailReset, setEmailReset] = useState('')
const [enviandoReset, setEnviandoReset] = useState(false)
const [mensagemReset, setMensagemReset] = useState(null)

if (usuario) {
return (
<>
<Header />
<div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
<h1 style={{ fontSize: 24, color: '#4a3728', marginBottom: 16 }}>Voce ja esta logado</h1>
<p style={{ color: '#555', marginBottom: 24 }}>{usuario.email}</p>
<a
href="/cardapio"
style={{
background: '#4a3728',
color: '#fff',
padding: '10px 24px',
borderRadius: 6,
textDecoration: 'none',
fontSize: 14,
}}
>
Ir para o cardapio
</a>
</div>
</>
)
}

async function handleSubmit(e) {
e.preventDefault()
setErro('')
setEnviando(true)

const { error } = await login(email, senha)
setEnviando(false)

if (error) {
if (error.message.includes('Email not confirmed')) {
setErro('Seu email ainda nao foi confirmado. Verifique sua caixa de entrada ou spam.')
} else {
setErro(error.message)
}
return
}

router.push('/cardapio')
}

async function handleResetSenha() {
if (!emailReset) {
setMensagemReset({ tipo: 'erro', texto: 'Informe seu email.' })
return
}

setEnviandoReset(true)
setMensagemReset(null)

try {
const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
redirectTo: `${window.location.origin}/atualizar-senha`,
})

if (error) {
setMensagemReset({ tipo: 'erro', texto: error.message || 'Erro ao enviar email de redefinicao.' })
} else {
setMensagemReset({ tipo: 'sucesso', texto: 'Email de redefinicao enviado! Verifique sua caixa de entrada.' })
}
} catch (err) {
setMensagemReset({ tipo: 'erro', texto: 'Erro ao enviar email. Tente novamente.' })
} finally {
setEnviandoReset(false)
}
}

return (
<>
<Header />
<div style={{ maxWidth: 400, margin: '40px auto' }}>
<h1 style={{ fontSize: 24, color: '#4a3728', marginBottom: 24 }}>Entrar</h1>

{erro && (
<p style={{ color: '#c00', fontSize: 13, marginBottom: 12, background: '#ffe8e8', padding: '8px 12px', borderRadius: 6 }}>
{erro}
</p>
)}

<form onSubmit={handleSubmit}>
<div style={{ marginBottom: 16 }}>
<label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Email</label>
<input
type="email"
required
value={email}
onChange={e => setEmail(e.target.value)}
style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
/>
</div>

<div style={{ marginBottom: 8 }}>
<label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4 }}>Senha</label>
<input
type="password"
required
value={senha}
onChange={e => setSenha(e.target.value)}
style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' }}
/>
</div>

<div style={{ textAlign: 'right', marginBottom: 24 }}>
<button
type="button"
onClick={() => {
setEmailReset(email)
setModalResetAberto(true)
setMensagemReset(null)
}}
style={{
background: 'none',
border: 'none',
color: '#4a3728',
fontSize: 13,
cursor: 'pointer',
textDecoration: 'underline',
padding: 0,
}}
>
Esqueceu a senha?
</button>
</div>

<button
type="submit"
disabled={enviando}
style={{
width: '100%',
background: enviando ? '#999' : '#4a3728',
color: '#fff',
border: 'none',
padding: '12px',
borderRadius: 6,
fontSize: 15,
cursor: enviando ? 'not-allowed' : 'pointer',
}}
>
{enviando ? 'Entrando...' : 'Entrar'}
</button>
</form>

<p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
Ainda nao tem conta?{' '}
<a href="/cadastro" style={{ color: '#4a3728' }}>Criar conta</a>
</p>

{/* Modal de esqueceu a senha */}
{modalResetAberto && (
<div
style={{
position: 'fixed', inset: 0, zIndex: 99999,
background: 'rgba(0,0,0,0.4)',
display: 'flex', alignItems: 'center', justifyContent: 'center',
padding: '24px',
}}
onClick={() => setModalResetAberto(false)}
>
<div
onClick={e => e.stopPropagation()}
style={{
background: '#fff', borderRadius: '12px',
padding: '32px', maxWidth: '400px', width: '100%',
boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
}}
>
<h2 style={{ fontSize: '20px', color: '#4a3728', margin: '0 0 8px 0', fontWeight: 700 }}>
Redefinir senha
</h2>
<p style={{ fontSize: '14px', color: '#666', margin: '0 0 20px 0', lineHeight: 1.5 }}>
Digite seu email abaixo e enviaremos um link para redefinir sua senha.
</p>

<div style={{ marginBottom: 16 }}>
<label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Email</label>
<input
type="email"
value={emailReset}
onChange={e => setEmailReset(e.target.value)}
placeholder="seu@email.com"
style={{
width: '100%', padding: '10px 12px',
border: '1px solid #ddd', borderRadius: '6px',
fontSize: '14px', boxSizing: 'border-box',
}}
/>
</div>

{mensagemReset && (
<p style={{
fontSize: '13px', marginBottom: '16px', padding: '8px 12px', borderRadius: '6px',
background: mensagemReset.tipo === 'sucesso' ? '#e8f5e9' : '#ffe8e8',
color: mensagemReset.tipo === 'sucesso' ? '#2e7d32' : '#c00',
}}>
{mensagemReset.texto}
</p>
)}

<div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
<button
onClick={() => {
setModalResetAberto(false)
setMensagemReset(null)
}}
style={{
background: 'transparent', border: '1px solid #ddd',
borderRadius: '6px', padding: '10px 20px',
cursor: 'pointer', fontSize: '14px', color: '#666',
}}
>
Cancelar
</button>
<button
onClick={handleResetSenha}
disabled={enviandoReset}
style={{
background: enviandoReset ? '#999' : '#4a3728',
color: '#fff', border: 'none',
borderRadius: '6px', padding: '10px 20px',
cursor: enviandoReset ? 'not-allowed' : 'pointer',
fontSize: '14px', fontWeight: 600,
opacity: enviandoReset ? 0.7 : 1,
}}
>
{enviandoReset ? 'Enviando...' : 'Enviar link'}
</button>
</div>
</div>
</div>
)}
</div>
</>
)
}