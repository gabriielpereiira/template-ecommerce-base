// Configuração central da loja Tortas da Lika
// Contém todos os parâmetros utilizados pelo sistema de e-commerce

// Identidade da marca
const identidade = {
  name: 'Tortas da Lika',
  subtitle: 'Confeitaria Artesanal',
  tagline: 'Fatias que contam histórias',
  description: 'Confeitaria artesanal especializada em tortas e fatias gourmet. Feitas sob encomenda com ingredientes selecionados e entregues com carinho em Rio Grande e região.',
  foundedYear: 2024,
  currency: 'BRL',
  locale: 'pt-BR'
};

// Informações de contato
const contato = {
  email: 'tortasdalika@outlook.com',
  phone: '(53) 99999-9999',
  instagram: '@tortasdalika'
};

// Endereço da confeitaria
const endereco = {
  street: '',
  number: '',
  neighborhood: '',
  city: 'Rio Grande',
  state: 'RS',
  zip: ''
};

// Configurações de logo e identidade visual
const logo = {
  default: '/logos/logo-default.svg',
  light: '/logos/logo-light.svg',
  dark: '/logos/logo-dark.svg',
  favicon: '/logos/favicon.svg',
  generatedFilenames: ['logo-default.svg', 'logo-light.svg', 'logo-dark.svg', 'logo-monogram.svg', 'logo-badge.svg', 'favicon.svg']
};

// Configurações de entrega
const entrega = {
  cities: ['Rio Grande'],
  maxDistanceKm: 15,
  costPerKm: 0.85,
  baseFee: 5.00,
  freeDeliveryMinimum: null,
  cutoffTime: '18:30',
  leadTimeHours: 24,
  timeSlots: [
    { label: 'Manhã (9h às 12h)', value: 'manha' },
    { label: 'Tarde (13h às 18h)', value: 'tarde' }
  ]
};

// Configurações de pedido
const pedido = {
  minOrderValue: 15.00,
  maxItemsPerProduct: 10,
  defaultOrderStatus: 'pendente',
  orderStatuses: ['pendente', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado']
};

// Configurações de pagamento
const pagamento = {
  methods: ['pix', 'credit_card'],
  installments: { max: 3, minInstallmentValue: 10.00 },
  pix: { enabled: true, discountPercent: 5 }
};

// Horário de funcionamento
const horarioFuncionamento = {
  weekday: { open: '09:00', close: '18:30' },
  saturday: { open: '09:00', close: '13:00' },
  sunday: null
};

// Configurações administrativas
const admin = {
  adminEmails: ['tortasdalika@outlook.com', 'gdspereira@hotmail.com']
};

// Links de navegação
const navegacao = {
  navLinks: [
    { href: '/cardapio', label: 'Cardápio' },
    { href: '/pedidos', label: 'Meus Pedidos' }
  ]
};

// Metadados para SEO e redes sociais
const meta = {
  title: 'Tortas da Lika - Confeitaria Artesanal em Rio Grande',
  description: 'Tortas, bolos e doces artesanais feitos sob encomenda com entrega em Rio Grande, RS. Fatias que contam histórias.',
  openGraphImage: '/og/og-image.png'
};

// Configurações do Mercado Pago
const mercadoPago = {
  webhookSecret: '',
  publicKey: ''
};

// Configuração principal da loja
export const storeConfig = {
  identidade,
  contato,
  endereco,
  logo,
  entrega,
  pedido,
  pagamento,
  horarioFuncionamento,
  admin,
  navegacao,
  meta,
  mercadoPago
};

// Clona profundamente um valor, suportando objetos e arrays
function cloneValue(valor) {
  if (valor === null || typeof valor !== 'object') {
    return valor;
  }
  if (Array.isArray(valor)) {
    return valor.map((item) => cloneValue(item));
  }
  const clone = {};
  for (const chave of Object.keys(valor)) {
    clone[chave] = cloneValue(valor[chave]);
  }
  return clone;
}

// Congela recursivamente um objeto, tornando-o imutável
function deepFreeze(objeto) {
  if (objeto === null || typeof objeto !== 'object') {
    return objeto;
  }
  Object.keys(objeto).forEach((chave) => {
    const valor = objeto[chave];
    if (valor !== null && typeof valor === 'object') {
      deepFreeze(valor);
    }
  });
  return Object.freeze(objeto);
}

// Retorna uma cópia imutável da configuração da loja
export function getStoreConfig() {
  return deepFreeze(cloneValue(storeConfig));
}