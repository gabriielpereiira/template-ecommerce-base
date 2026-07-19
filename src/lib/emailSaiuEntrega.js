// src/lib/emailSaiuEntrega.js
// Template de email para pedido saiu para entrega

import { storeConfig } from '@/config/store'

export function gerarEmailSaiuEntrega({ nomeCliente, pedidoId }) {
  const { identidade } = storeConfig
  const nomeLoja = identidade.name
  const cores = {
    fundo: '#F8F9FA',
    branco: '#FFFFFF',
    primaria: '#FF6B6B',
    escuro: '#2D3436',
    texto: '#636E72',
    textoEscuro: '#2D3436',
    borda: '#E8E8E8'
  }

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: ${cores.fundo}; font-family: 'Inter', Arial, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding: 40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background: ${cores.branco}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
<tr>
<td style="padding: 40px 40px 24px; background: linear-gradient(135deg, ${cores.escuro} 0%, #4A5558 100%); text-align: center;">
<h1 style="margin: 0; font-size: 22px; color: ${cores.branco}; font-family: Georgia, serif; font-weight: 700; letter-spacing: 1px;">${nomeLoja}</h1>
</td>
</tr>
<tr>
<td style="padding: 32px 40px;">
<p style="margin: 0 0 20px; font-size: 16px; color: ${cores.textoEscuro}; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
Ola <strong>${nomeCliente}</strong>,
</p>
<p style="margin: 0 0 20px; font-size: 14px; color: ${cores.texto}; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
Seu pedido <strong>#${pedidoId ? pedidoId.slice(0, 8).toUpperCase() : ''}</strong> saiu para entrega! Fique atento ao seu endereco, pois em breve o entregador chegara.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
<tr>
<td style="padding: 20px; background: ${cores.fundo}; border-radius: 10px; border-left: 4px solid ${cores.primaria};">
<p style="margin: 0; font-size: 14px; color: ${cores.textoEscuro}; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
Seu pedido ja saiu e esta a caminho. Certifique-se de que alguem estara no endereco para receber.
</p>
</td>
</tr>
</table>

<p style="margin: 0; font-size: 14px; color: ${cores.texto}; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
Apos o recebimento, aproveite! Qualquer duvida, entre em contato conosco.
</p>
</td>
</tr>
<tr>
<td style="padding: 24px 40px; background: ${cores.fundo}; text-align: center; border-top: 1px solid ${cores.borda};">
<p style="margin: 0; font-size: 12px; color: ${cores.texto}; font-family: 'Inter', Arial, sans-serif;">
${nomeLoja}
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`
}