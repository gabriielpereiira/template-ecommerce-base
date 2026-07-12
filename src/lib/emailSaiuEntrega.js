export function emailSaiuEntrega({ nomeCliente, pedidoId }) {
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

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2D1B0E 0%, #4A2F1A 100%); padding: 40px 32px; text-align: center;">
                  <h1 style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: #C4975A; font-weight: 700; letter-spacing: 1px;">
                    Pedido a Caminho!
                  </h1>
                  <p style="margin: 8px 0 0; font-size: 16px; color: #D4A97A; font-family: 'Inter', Arial, sans-serif;">
                    Seu pedido saiu para entrega
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
                    Seu pedido <strong>#${pedidoId ? pedidoId.slice(0, 8).toUpperCase() : ''}</strong> saiu para entrega!
                    Fique atento ao seu endereço, pois em breve o entregador chegará.
                  </p>

                  <!-- Card de alerta -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 20px; background: #FFF8F0; border-radius: 10px; border: 1px solid #E8D9C5;">
                        <p style="margin: 0 0 8px; font-size: 14px; color: #2D1B0E; font-weight: 700; font-family: 'Inter', Arial, sans-serif;">
                          Fique atento
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #6B4F3A; line-height: 1.6; font-family: 'Inter', Arial, sans-serif;">
                          Seu pedido ja saiu e esta a caminho. Certifique-se de que alguem estara no endereco para receber.
                          Apos o recebimento, aproveite sua torta!
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
