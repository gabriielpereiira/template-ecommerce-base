// src/lib/emailPedidoConfirmado.js
// Template de email para pagamento confirmado

import { storeConfig } from '@/config/store'

export function gerarEmailConfirmado({ nomeCliente, pedidoId, itens, total, enderecoEntrega, formaEntrega }) {
  const { identidade } = storeConfig
  const nomeLoja = identidade.name
  const cores = {
    fundo: '#F8F9FA',
    branco: '#FFFFFF',
    primaria: '#FF6B6B',
    secundaria: '#00CEC9',
    escuro: '#2D3436',
    texto: '#636E72',
    textoEscuro: '#2D3436',
    borda: '#E8E8E8'
  }

  const itensHtml = (itens || []).map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid ${cores.borda}; font-size: 14px; color: ${cores.textoEscuro}; font-family: 'Inter', Arial, sans-serif;">
        ${item.quantidade}x ${item.nome}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid ${cores.borda}; font-size: 14px; color: ${cores.textoEscuro}; text-align: right; font-family: 'Inter', Arial, sans-serif;">
        R$ ${Number(item.preco).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('')

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
O pagamento do seu pedido foi confirmado com sucesso! Abaixo estao os detalhes.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
<tr>
<td style="padding: 16px; background: ${cores.fundo}; border-radius: 10px; border: 1px solid ${cores.borda};">
<p style="margin: 0; font-size: 12px; color: ${cores.texto}; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', Arial, sans-serif;">
Pedido
</p>
<p style="margin: 4px 0 0; font-size: 18px; color: ${cores.textoEscuro}; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">
#${pedidoId ? pedidoId.slice(0, 8).toUpperCase() : ''}
</p>
</td>
</tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
<tr>
<td style="padding-bottom: 12px; border-bottom: 2px solid ${cores.escuro};">
<h2 style="margin: 0; font-size: 16px; color: ${cores.textoEscuro}; font-family: Georgia, serif;">Itens do pedido</h2>
</td>
</tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
${itensHtml}
</table>

${enderecoEntrega && formaEntrega !== 'retirar' ? `
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="padding-top: 12px; border-top: 1px solid ${cores.borda};">
<p style="margin: 0 0 8px; font-size: 12px; color: ${cores.texto}; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', Arial, sans-serif;">Endereco de entrega</p>
<p style="margin: 0; font-size: 14px; color: ${cores.textoEscuro}; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">${enderecoEntrega}</p>
</td>
</tr>
</table>
` : ''}

<table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
<tr>
<td style="padding-top: 16px; border-top: 2px solid ${cores.primaria};">
<p style="margin: 0; font-size: 22px; color: ${cores.textoEscuro}; font-weight: 700; text-align: right; font-family: 'Inter', Arial, sans-serif;">
Total: R$ ${Number(total).toFixed(2).replace('.', ',')}
</p>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding: 24px 40px; background: ${cores.fundo}; text-align: center; border-top: 1px solid ${cores.borda};">
<p style="margin: 0; font-size: 12px; color: ${cores.texto}; font-family: 'Inter', Arial, sans-serif;">
${nomeLoja}<br>
Obrigado pela preferencia!
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