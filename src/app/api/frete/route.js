import { NextResponse } from 'next/server'
import { storeConfig } from '@/config/store'

const ORIGIN_LAT = -32.06035
const ORIGIN_LON = -52.15057
const USER_AGENT = 'TortasDaLika/1.0'
const MAX_KM = storeConfig.entrega.maxDistanceKm

const FAIXAS = [
  { limite: 2, valor: 8.00 },
  { limite: 4, valor: 10.00 },
  { limite: 6, valor: 12.00 },
  { limite: 8, valor: 15.00 },
  { limite: 10, valor: 18.00 },
  { limite: 12, valor: 22.00 },
  { limite: 15, valor: 25.00 },
]

const FRETE_POR_BAIRRO = {
  'vila sao joao': 8.00,
  hidraulica: 10.00,
  centro: 12.00,
  'cidade nova': 12.00,
  'sao paulo': 12.00,
  'vila maria': 12.00,
  'vila juncao': 12.00,
  'getulio vargas': 12.00,
  'vila militar': 12.00,
  carreiros: 12.00,
  'castelo branco': 12.00,
  cohab: 12.00,
  'lar gaucho': 12.00,
  'santa rita de cassia': 12.00,
  'parque marinha': 15.00,
  'vila sao miguel': 15.00,
  'cidade de agueda': 15.00,
  'vila sao jorge': 15.00,
  lagoa: 15.00,
  profilurbi: 15.00,
  'parque residencial sao pedro': 15.00,
  cassino: 18.00,
  quinta: 18.00,
  'vila bernardeth': 22.00,
  'vila maria jose': 22.00,
  'nossa senhora dos navegantes': 22.00,
  senandes: 22.00,
  'frederico ernesto buchholz': 22.00,
  'miguel de castro moreira': 22.00,
  bolaxa: 25.00,
  'povo novo': 25.00,
  taim: 25.00,
  america: 25.00,
  'zona portuaria': 15.00,
}

const FRETE_PADRAO = 15.00

function calcularPorFaixa(distanciaKm) {
  for (const faixa of FAIXAS) {
    if (distanciaKm <= faixa.limite) return faixa.valor
  }
  return null
}

function buscarBairro(nome) {
  if (!nome) return null
  const n = nome.toLowerCase().trim()
  if (FRETE_POR_BAIRRO[n] !== undefined) return FRETE_POR_BAIRRO[n]
  for (const [key, valor] of Object.entries(FRETE_POR_BAIRRO)) {
    if (n.includes(key) || key.includes(n)) return valor
  }
  return null
}

async function getCoords(partes) {
  const queries = [
    partes.filter(Boolean).join(', '),
    `${partes[0] || ''}, ${partes[1] || ''}, ${partes[2] || ''}, ${partes[3] || ''}`,
  ]
  if (partes[1]) queries.push(`${partes[1]}, ${partes[2]}, ${partes[3]}`)
  for (const q of queries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&countrycodes=br`
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
    const res = await fetch(url)
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

    const endereco = [viaCepData.logradouro, viaCepData.bairro, viaCepData.localidade, viaCepData.uf, viaCepData.cep]
      .filter(Boolean).join(', ')

    // Tenta calcular distancia real via OSRM
    let distanciaKm = null
    const partes = [viaCepData.logradouro, viaCepData.bairro, viaCepData.localidade, viaCepData.uf].filter(Boolean)
    const coords = await getCoords(partes)
    if (coords) distanciaKm = await getDistance(coords)

    let valorFrete, metodo, faixaLimite

    if (distanciaKm !== null && distanciaKm <= MAX_KM) {
      valorFrete = calcularPorFaixa(distanciaKm)
      if (valorFrete !== null) {
        metodo = 'osrm_faixa'
        for (const f of FAIXAS) {
          if (distanciaKm <= f.limite) { faixaLimite = f.limite; break }
        }
      } else {
        // Distancia acima de 15 km, tenta fallback por bairro
        valorFrete = buscarBairro(viaCepData.bairro) || FRETE_PADRAO
        metodo = 'fallback_bairro'
      }
    } else {
      // OSRM falhou ou distancia > 15 km
      valorFrete = buscarBairro(viaCepData.bairro) || FRETE_PADRAO
      metodo = distanciaKm !== null && distanciaKm > MAX_KM ? 'fora_limite_fallback' : 'fallback_bairro'
    }

    const valorFinal = Math.round(valorFrete * 100) / 100

    return NextResponse.json({
      success: true,
      data: {
        valor_frete: valorFinal,
        endereco,
        bairro: viaCepData.bairro || 'Nao identificado',
        distancia_km: distanciaKm ? Math.round(distanciaKm * 10) / 10 : null,
        faixa_limite_km: faixaLimite || null,
        metodo,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, erro: error.message }, { status: 500 })
  }
}