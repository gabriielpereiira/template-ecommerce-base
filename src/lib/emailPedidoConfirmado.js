export function emailPedidoConfirmado({ nomeCliente, pedidoId, itens, totalFormatado, formaPagamento, formaEntrega, enderecoEntrega, tipoEntrega }) {
  const itensHtml = itens.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #E8E0D8; font-size: 14px; color: #2D1B0E; font-family: 'Inter', Arial, sans-serif;">
        ${item.quantidade}x ${item.nome}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #E8E0D8; font-size: 14px; color: #2D1B0E; text-align: right; font-family: 'Inter', Arial, sans-serif;">
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
    <body style="margin: 0; padding: 0; background: #FAF7F2; font-family: 'Inter', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding: 40px 16px;">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(45,27,14,0.08);">
              <tr>
                <td style="padding: 40px 40px 24px; background: linear-gradient(135deg, #2D1B0E 0%, #4A3020 100%); text-align: center;">
                  <h1 style="margin: 0; font-size: 22px; color: #C4975A; font-family: Georgia, serif; font-weight: 700; letter-spacing: 1px;">Tortas da Lika</h1>
                  <p style="margin: 8px 0 0; font-size: 13px; color: #E8E0D8; letter-spacing: 2px; text-transform: uppercase;">Confeitaria Artesanal</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px 40px;">
                  <p style="margin: 0 0 20px; font-size: 16px; color: #2D1B0E; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
                    Olá <strong style="color: #2D1B0E;">${nomeCliente}</strong>,
                  </p>
                  <p style="margin: 0 0 20px; font-size: 14px; color: #6B4F3A; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
                    Seu pedido foi confirmado com sucesso e já está sendo preparado com todo carinho.
                    Seu pedido entrará em preparação em breve. Assim que estiver pronto, você receberá outra notificação.
                    Acompanhe o status pelo site em <strong>Meus Pedidos</strong>.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 16px; background: #FFF8F0; border-radius: 10px; border: 1px solid #E8D9C5;">
                        <p style="margin: 0; font-size: 12px; color: #6B4F3A; text-transform: uppercase; letter-spacing: 1px; font-family: 'Inter', Arial, sans-serif;">
                          Pedido
                        </p>
                        <p style="margin: 4px 0 0; font-size: 18px; color: #2D1B0E; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">
                          #${pedidoId ? pedidoId.slice(0, 8).toUpperCase() : ''}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding-bottom: 12px; border-bottom: 2px solid #2D1B0E;">
                        <h2 style="margin: 0; font-size: 16px; color: #2D1B0E; font-family: Georgia, serif;">Itens do pedido</h2>
                      </td>
                    </tr>
                    ${itensHtml}
                    <tr>
                      <td style="padding: 12px 0 0; text-align: right;">
                        <p style="margin: 0; font-size: 18px; color: #2D1B0E; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">
                          Total: ${totalFormatado}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding-bottom: 12px; border-bottom: 2px solid #2D1B0E;">
                        <h2 style="margin: 0; font-size: 16px; color: #2D1B0E; font-family: Georgia, serif;">Detalhes da entrega</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #6B4F3A; font-family: 'Inter', Arial, sans-serif;">
                              Forma de pagamento:
                            </td>
                            <td style="padding: 4px 0; font-size: 14px; color: #2D1B0E; text-align: right; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
                              ${formaPagamento === 'pix' ? 'PIX' : 'Cartão'}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #6B4F3A; font-family: 'Inter', Arial, sans-serif;">
                              Tipo de entrega:
                            </td>
                            <td style="padding: 4px 0; font-size: 14px; color: #2D1B0E; text-align: right; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
                              ${tipoEntrega === 'retirar' ? 'Retirada no local' : 'Entrega em domicílio'}
                            </td>
                          </tr>
                          ${enderecoEntrega ? `
                          <tr>
                            <td style="padding: 4px 0; font-size: 14px; color: #6B4F3A; font-family: 'Inter', Arial, sans-serif;" valign="top">
                              Endereço:
                            </td>
                            <td style="padding: 4px 0; font-size: 14px; color: #2D1B0E; text-align: right; font-weight: 600; font-family: 'Inter', Arial, sans-serif;">
                              ${enderecoEntrega}
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 40px; background: #FAF7F2; text-align: center; border-top: 1px solid #E8E0D8;">
                  <p style="margin: 0; font-size: 12px; color: #6B4F3A; font-family: 'Inter', Arial, sans-serif;">
                    Tortas da Lika — Confeitaria Artesanal<br>
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