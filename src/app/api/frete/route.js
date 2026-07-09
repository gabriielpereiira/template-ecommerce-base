import { NextResponse } from 'next/server'
import { storeConfig } from '@/config/store'

const ORIGIN_LAT = -32.0745
const ORIGIN_LON = -52.1200
const USER_AGENT = 'TortasDaLika/1.0'

const ROUND_TRIP_PRICE_PER_KM = storeConfig.entrega.costPerKm * 2 + 0.70
const MINIMUM_FREIGHT = storeConfig.entrega.baseFee
const MAX_KM_RIO_GRANDE = storeConfig.entrega.maxDistanceKm

const FRETE_FALLBACK_POR_BAIRRO = {
  centro: 8.00,
  'cidade nova': 8.00,
  'vila maria': 8.00,
  'vila juncao': 10.00,
  'marechal rondon': 10.00,
  'sao paulo': 10.00,
  'sao joao': 10.00,
  'sao miguel': 10.00,
  cassino: 10.00,
  'vila tamandare': 10.00,
  'vila santa rosa': 10.00,
  'vila militar': 10.00,
  'vila sao pedro': 10.00,
  'parque marinha': 15.00,
  'cidade de agueda': 15.00,
  'getulio vargas': 15.00,
  quinta: 15.00,
  hidraulica: 15.00,
  'vila sao jorge': 15.00,
  'vila da lomba': 15.00,
  'vila santa tereza': 15.00,
  'vila sao camilo': 18.00,
  bolaxa: 18.00,
  'vila emilia': 18.00,
  progreso: 18.00,
  taim: 25.00,
  'sao luis': 25.00,
  'povo novo': 25.00,
  bosque: 25.00,
}

const FRETE_FALLBACK_PADRAO = 15.00

function normalizarBairro(bairro) {
  if (!bairro) return ''
  const nome = bairro.toLowerCase().trim()
  if (FRETE_FALLBACK_POR_BAIRRO[nome] !== undefined) return nome
  for (const key of Object.keys(FRETE_FALLBACK_POR_BAIRRO)) {
    if (nome.includes(key) || key.includes(nome)) return key
  }
  const partes = nome.split(/\s+/)
  for (const parte of partes) {
    if (parte.length < 3) continue
    for (const key of Object.keys(FRETE_FALLBACK_POR_BAIRRO)) {
      if (key.includes(parte)) return key
    }
  }
  return ''
}

function calcularFreteFallback(endereco) {
  const bairro = normalizarBairro(endereco.bairro)
  if (bairro) return FRETE_FALLBACK_POR_BAIRRO[bairro]
  return FRETE_FALLBACK_PADRAO
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const cep = searchParams.get('cep')

  const cleanCep = cep ? cep.replace(/\D/g, '') : ''
  if (!/^\d{8}$/.test(cleanCep)) {
    return NextResponse.json(
  { success: false, erro: 'CEP invalido' },
  { status: 400 }
)
  }

  try {
const viaCepUrl = `https://viacep.com.br/ws/${cleanCep}/json/`
    const viaCepRes = await fetch(viaCepUrl, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (!viaCepRes.ok) {
      throw new Error('Falha ao consultar ViaCEP')
    }

    const viaCepData = await viaCepRes.json()
    if (viaCepData.erro) {
      throw new Error('CEP nao encontrado no ViaCEP')
    }

    if (
      viaCepData.localidade?.toUpperCase() !== 'RIO GRANDE' ||
      viaCepData.uf?.toUpperCase() !== 'RS'
    ) {
      throw new Error('Entregas disponiveis apenas para Rio Grande - RS')
    }

    const endereco = [
      viaCepData.logradouro,
      viaCepData.bairro,
      viaCepData.localidade,
      viaCepData.uf,
      viaCepData.cep,
    ]
      .filter(Boolean)
      .join(', ')

    let valorFrete = null
    let distanciaKm = null
    let usouFallback = false

    try {
      const queries = []

      const partesEndereco = [
        viaCepData.logradouro,
        viaCepData.bairro,
        viaCepData.localidade,
        viaCepData.uf,
      ].filter(Boolean)
      if (partesEndereco.length >= 2) {
        queries.push(partesEndereco.join(', '))
      }

      queries.push(`${cleanCep}, ${viaCepData.localidade}, ${viaCepData.uf}`)

      if (viaCepData.bairro) {
        queries.push(
          `${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}`
        )
      }

      let coords = null

      for (const query of queries) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=br`
          const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT },
          })
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              coords = {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              }
              break
            }
          }
        } catch {
          // tenta proxima
        }
      }

      if (coords) {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${ORIGIN_LON},${ORIGIN_LAT};${coords.lon},${coords.lat}?overview=false`

        const osrmRes = await fetch(url, {
          headers: { 'User-Agent': USER_AGENT },
        })

        if (osrmRes.ok) {
          const osrmData = await osrmRes.json()
          if (osrmData.routes && osrmData.routes.length > 0) {
            distanciaKm = osrmData.routes[0].distance / 1000

            if (distanciaKm <= MAX_KM_RIO_GRANDE) {
              valorFrete = distanciaKm * ROUND_TRIP_PRICE_PER_KM
              if (valorFrete < MINIMUM_FREIGHT) {
                valorFrete = MINIMUM_FREIGHT
              }
            } else {
              valorFrete = calcularFreteFallback(viaCepData)
              usouFallback = true
            }
          }
        }
      }
    } catch {
      // se falhou, fallback
    }

    if (valorFrete === null) {
      valorFrete = calcularFreteFallback(viaCepData)
      usouFallback = true
    }

    const valorFinal = Math.round(valorFrete * 100) / 100

    return NextResponse.json({
  success: true,
  data: {
    distancia_km: usouFallback ? null : Math.round(distanciaKm * 10) / 10,
    valor_frete: valorFinal,
    endereco,
    bairro: viaCepData.bairro,
    metodo: usouFallback ? 'fixo_por_bairro' : 'calculado_por_distancia',
  },
})
  } catch (error) {
    return NextResponse.json(
  { success: false, erro: error.message },
  { status: 500 }
)
  }
}