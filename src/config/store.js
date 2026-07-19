// Configuracao central do template ecommerce-base
// Edite os valores abaixo para personalizar para sua marca

const identidade = {
  name: 'Sua Loja',
  subtitle: 'Sua Marca',
  tagline: 'Seu slogan aqui',
  description: 'Descricao da sua loja. Edite em src/config/store.js.',
  foundedYear: 2024,
  currency: 'BRL',
  locale: 'pt-BR'
};

const contato = {
  email: 'seu@email.com',
  phone: '(53) 99999-9999',
  instagram: '@seudelivery'
};

const endereco = {
  street: '', number: '', neighborhood: '',
  city: 'Sua Cidade', state: 'RS', zip: ''
};

const logo = {
  url: '/logo.png', alt: 'Sua Loja', width: 38, height: 38
};

const entrega = {
  cities: ['Sua Cidade'],
  maxDistanceKm: 15, costPerKm: 0.85, baseFee: 5.00,
  freeDeliveryMinimum: null, cutoffTime: '18:30', leadTimeHours: 24,
  timeSlots: [
    { label: 'Manha (9h as 12h)', value: 'manha' },
    { label: 'Tarde (13h as 18h)', value: 'tarde' }
  ]
};

const pedido = {
  minOrderValue: 15.00, maxItemsPerProduct: 10,
  defaultOrderStatus: 'pendente',
  orderStatuses: ['pendente', 'confirmado', 'preparando', 'pronto', 'saiu_entrega', 'entregue', 'cancelado']
};

const pagamento = {
  methods: ['pix', 'credit_card'],
  installments: { max: 3, minInstallmentValue: 10.00 },
  pix: { enabled: true, discountPercent: 5 }
};

const horarioFuncionamento = {
  weekday: { open: '09:00', close: '18:30' },
  saturday: { open: '09:00', close: '13:00' },
  sunday: null
};

const admin = {
  adminEmails: ['admin@seudominio.com']
};

const navegacao = {
  navLinks: [
    { href: '/cardapio', label: 'Cardapio' },
    { href: '/pedidos', label: 'Meus Pedidos' }
  ]
};

const meta = {
  title: 'Sua Loja - Delivery',
  description: 'Sua loja online com delivery. Edite em src/config/store.js.',
  openGraphImage: '/og/og-image.png'
};

const mercadoPago = {
  webhookSecret: '', publicKey: ''
};

export const storeConfig = {
  identidade, contato, endereco, logo, entrega, pedido,
  pagamento, horarioFuncionamento, admin, navegacao, meta, mercadoPago
};

function cloneValue(valor) {
  if (valor === null || typeof valor !== 'object') return valor;
  if (Array.isArray(valor)) return valor.map(cloneValue);
  const clone = {};
  for (const chave of Object.keys(valor)) clone[chave] = cloneValue(valor[chave]);
  return clone;
}

function deepFreeze(objeto) {
  if (objeto === null || typeof objeto !== 'object') return objeto;
  Object.keys(objeto).forEach((chave) => {
    if (objeto[chave] !== null && typeof objeto[chave] === 'object') deepFreeze(objeto[chave]);
  });
  return Object.freeze(objeto);
}

export function getStoreConfig() {
  return deepFreeze(cloneValue(storeConfig));
}