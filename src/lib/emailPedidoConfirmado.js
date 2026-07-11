export function emailPedidoConfirmado({ nomeCliente, pedidoId, total, itens }) {
  const formatarPreco = (valor) => {
    if (valor == null) return 'R$ 0,00'
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`
  }

  const itensHtml = (itens || []).map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #F0EAE0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #3D2817;">
        ${item.quantidade || 1}x ${item.nome}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #F0EAE0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #C4975A; text-align: right; font-weight: 600;">
        ${formatarPreco((item.preco || 0) * (item.quantidade || 1))}
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
    <body style="margin: 0; padding: 0; background: #FAF7F2; font-family: 'Inter', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAF7F2; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(45,27,14,0.08);">

              <!-- Header escuro com dourado -->
              <tr>
                <td style="background: linear-gradient(135deg, #2D1B0E 0%, #4A2F1A 100%); padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #C4975A; font-weight: 700; letter-spacing: 1px;">
                    Pedido Confirmado
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 16px; color: #D4A97A; font-family: 'Inter', Arial, sans-serif;">
                    Obrigado por comprar na Tortas da Lika!
                  </p>
                </td>
              </tr>

              <!-- Corpo -->
              <tr>
                <td style="padding: 32px;">
                  <p style="margin: 0 0 16px; font-size: 16px; color: #3D2817; font-family: 'Inter', Arial, sans-serif;">
                    Ola <strong style="color: #2D1B0E;">${nomeCliente}</strong>,
                  </p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #6B4F3A; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
                    Seu pedido foi confirmado com sucesso e ja esta sendo preparado com todo carinho.
                    Em breve voce recebera uma atualizacao quando estiver pronto para retirada ou entrega.
                  </p>

                  <!-- Card do pedido -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #F5EDE3; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 4px; font-size: 12px; color: #6B4F3A; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
                          Pedido
                        </p>
                        <p style="margin: 0 0 16px; font-size: 16px; color: #2D1B0E; font-weight: 700; font-family: Georgia, 'Times New Roman', serif;">
                          #${pedidoId ? pedidoId.slice(0, 8).toUpperCase() : ''}
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0">
                          ${itensHtml}
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #E8E0D8;">
                          <tr>
                            <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 700; color: #2D1B0E; padding: 4px 0;">
                              Total
                            </td>
                            <td style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: 700; color: #C4975A; text-align: right; padding: 4px 0;">
                              ${formatarPreco(total)}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- Proximos passos -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px; background: #FFF8F0; border-radius: 10px; border: 1px solid #E8D9C5;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #2D1B0E; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">
                          Proximos passos
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #6B4F3A; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
                          Seu pedido entrara em preparacao em breve. Assim que estiver pronto, voce recebera outra notificacao.
                          Acompanhe o status pelo site em <strong>Meus Pedidos</strong>.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Botao -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://tortas-da-lika.vercel.app/pedidos"
                           style="display: inline-block; padding: 12px 32px; border-radius: 999px; background: #2D1B0E; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; font-family: 'Inter', Arial, sans-serif;">
                          Acompanhar Pedido
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #FAF7F2; padding: 24px 32px; text-align: center; border-top: 1px solid #F0EAE0;">
                  <p style="margin: 0; font-size: 12px; color: #A89E90; font-family: 'Inter', Arial, sans-serif;">
                    Tortas da Lika &mdash; Confeitaria Artesanal
                  </p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #A89E90; font-family: 'Inter', Arial, sans-serif;">
                    Rio Grande, RS
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