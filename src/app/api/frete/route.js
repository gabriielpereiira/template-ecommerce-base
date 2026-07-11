import { NextResponse } from 'next/server'
import { storeConfig } from '@/config/store'

const ORIGIN_LAT = -32.0745
const ORIGIN_LON = -52.1200
const USER_AGENT = 'TortasDaLika/1.0'

const TAXA_FAIXAS = [
  { limite: 2, valor: 8.00 },
  { limite: 4, valor: 10.00 },
  { limite: 6, valor: 12.00 },
  { limite: 8, valor: 15.00 },
  { limite: 10, valor: 18.00 },
  { limite: 12, valor: 22.00 },
  { limite: 15, valor: 25.00 },
]

function calcularFretePorFaixa(distanciaKm) {
  for (const faixa of TAXA_FAIXAS) {
    if (distanciaKm <= faixa.limite) {
      return faixa.valor
    }
  }
  // Acima de 15 km (fora da area de entrega)
  return null
}

async function getCoords(enderecoPartes) {
  const queries = []
  if (enderecoPartes.length >= 2) queries.push(enderecoPartes.join(', '))
  queries.push(`${enderecoPartes[0]}, ${enderecoPartes[1]}, ${enderecoPartes[2]}, ${enderecoPartes[3]}`)
  if (enderecoPartes[1]) queries.push(`${enderecoPartes[1]}, ${enderecoPartes[2]}, ${enderecoPartes[3]}`)

  for (const query of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (res.ok) {
        const data = await res.json()
        if (data?.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch { /* tenta proxima */ }
  }
  return null
}

async function getDistance(coords) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${ORIGIN_LON},${ORIGIN_LAT};${coords.lon},${coords.lat}?overview=false`
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (res.ok) {
      const data = await res.json()
      if (data?.routes?.length > 0) return data.routes[0].distance / 1000
    }
  } catch { /* fallback */ }
  return null
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const cep = searchParams.get('cep')
  const cleanCep = cep ? cep.replace(/\D/g, '') : ''

  if (!/^\d{8}$/.test(cleanCep)) {
    return NextResponse.json({ success: false, erro: 'CEP invalido' }, { status: 400 })
  }

  try {
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
    if (!viaCepRes.ok) throw new Error('Falha ao consultar ViaCEP')
    const viaCepData = await viaCepRes.json()
    if (viaCepData.erro) throw new Error('CEP nao encontrado')

    if (viaCepData.localidade?.toUpperCase() !== 'RIO GRANDE' || viaCepData.uf?.toUpperCase() !== 'RS') {
      throw new Error('Entregas disponiveis apenas para Rio Grande - RS')
    }

    const endereco = [
      viaCepData.logradouro, viaCepData.bairro,
      viaCepData.localidade, viaCepData.uf, viaCepData.cep,
    ].filter(Boolean).join(', ')

    // Busca coordenadas e distancia
    let distanciaKm = null
    let valorFrete = null
    let faixaUsada = null

    const partes = [viaCepData.logradouro, viaCepData.bairro, viaCepData.localidade, viaCepData.uf].filter(Boolean)
    const coords = await getCoords(partes)
    if (coords) distanciaKm = await getDistance(coords)

    if (distanciaKm !== null) {
      valorFrete = calcularFretePorFaixa(distanciaKm)
      // Descobre qual faixa foi usada
      for (const faixa of TAXA_FAIXAS) {
        if (distanciaKm <= faixa.limite) {
          faixaUsada = faixa.limite
          break
        }
      }
    }

    if (valorFrete === null) {
      throw new Error('CEP fora da area de entrega (maximo 15 km)')
    }

    const valorFinal = Math.round(valorFrete * 100) / 100

    return NextResponse.json({
      success: true,
      data: {
        valor_frete: valorFinal,
        endereco,
        bairro: viaCepData.bairro || 'Nao identificado',
        distancia_km: distanciaKm ? Math.round(distanciaKm * 10) / 10 : null,
        faixa_limite_km: faixaUsada,
        metodo: 'faixa_distancia',
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, erro: error.message }, { status: 500 })
  }
}