/**
 * ==========================================================================
 * SONOVOLT Produções e Eventos - Dados Dinâmicos do Site & Portfólio
 * ==========================================================================
 */

const SONOVOLT_CONFIG = {
  // Informações de Contato, Localização e Redes Sociais
  company: {
    name: "SONOVOLT",
    tagline: "PRODUÇÕES & EVENTOS",
    slogan: "Potência, tecnologia e infraestrutura completa para o seu evento.",
    email: "sonovolteventos@gmail.com",
    phone: "(12) 98183-0623",
    whatsapp: "(12) 98183-0623",
    whatsappLink: "https://wa.me/5512981830623?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20com%20a%20SONOVOLT%20Eventos.",
    city: "Guaratinguetá - SP",
    location: "Guaratinguetá-SP • Vale do Paraíba e Região",
    logo: "assets/logo-sonovolt.jpg",
    
    social: {
      instagram: "https://www.instagram.com/sonovolteventos",
      instagramHandle: "@sonovolteventos",
      facebook: "https://www.facebook.com/sonovolteventos",
      facebookName: "SONOVOLT Produções & Eventos",
      youtube: "https://www.youtube.com"
    }
  },

  // Banner Principal (Hero)
  hero: {
    eyebrow: "Guaratinguetá-SP • Vale do Paraíba",
    title: "Seu evento com a máxima<br><span class=\"gradient\">potência & estrutura.</span>",
    desc: "Somos agentes de eventos especialistas em infraestrutura completa: montagem, desmontagem técnica, locação de som profissional, iluminação cênica, palcos, painéis de LED e estruturas para festivais, eventos corporativos, públicos, fechados, casamentos e formaturas."
  },

  // Serviços e Infraestrutura
  services: [
    {
      id: "sonorizacao",
      icon: "⚡",
      title: "Sonorização Profissional",
      desc: "Sistemas Line Array de alta pressão e fidelidade acústica, subwoofers pesados, mesas de som digitais e microfonia profissional.",
      items: [
        "Sistemas Line Array e subwoofers para grandes públicos",
        "Mesas digitais e alinhamento acústico profissional",
        "Microfones sem fio de alta frequência e monitores in-ear"
      ]
    },
    {
      id: "iluminacao",
      icon: "☼",
      title: "Iluminação Cênica & Efeitos",
      desc: "Projetos de iluminação computadorizada com moving heads, refletores LED, efeitos especiais, máquinas de fumaça e controle DMX.",
      items: [
        "Moving heads Beam, Spot e Wash de longo alcance",
        "Refletores PAR LED, ribaltas e luz ambiental decorativa",
        "Máquinas de fumaça, haze e efeitos cênicos visuais"
      ]
    },
    {
      id: "palcos_estruturas",
      icon: "⌂",
      title: "Palcos, Box Truss & Tendas",
      desc: "Montagem de estruturas metálicas Q30 e Q50 certificadas, praticáveis pantográficos de altura ajustável, pórticos e coberturas.",
      items: [
        "Palcos elevados com acabamento profissional e escada",
        "Grids aéreos, torres de elevação e pórticos Box Truss",
        "Tendas para áreas abertas e fechamentos de segurança"
      ]
    },
    {
      id: "multimidia",
      icon: "▣",
      title: "Painéis de LED & Vídeo",
      desc: "Painéis de LED de alta resolução para transmissão de shows, apresentações corporativas, vinhetas e cenografia digital.",
      items: [
        "Painéis de LED P3/P4 indoor e outdoor",
        "Processadoras de vídeo e switcher de câmeras ao vivo",
        "Retorno para palco e projeção sincronizada"
      ]
    },
    {
      id: "montagem_desmontagem",
      icon: "✓",
      title: "Montagem, Desmontagem & Logística",
      desc: "Logística ágil e equipe de carregamento e montagem qualificada, com transporte próprio e rigoroso cumprimento de horários.",
      items: [
        "Transporte dedicado com agilidade no Vale do Paraíba",
        "Passagem de cabos protegida e organização de palco",
        "Desmontagem rápida sem deixar resíduos no local"
      ]
    },
    {
      id: "locacao_operacao",
      icon: "▤",
      title: "Locação com Técnicos Residentes",
      desc: "Não apenas alugamos: nossos técnicos de áudio e iluminação permanecem 100% do tempo no seu evento para garantir que nada falhe.",
      items: [
        "Técnico de som e operador de iluminação presencial",
        "Suporte técnico imediato durante todo o cronograma",
        "Atendimento a riders técnicos de bandas e artistas"
      ]
    }
  ],

  // 📸 Galeria "Quem Somos" (Até 4 fotos com ajuste perfeito no retângulo arredondado)
  about: {
    fitMode: "cover", // "cover" (preenche perfeitamente o retângulo arredondado) ou "contain" (foto inteira)
    photos: [
      { id: 1, url: "assets/logo-sonovolt.jpg", title: "Logo Oficial SONOVOLT" },
      { id: 2, url: "assets/hero-banner.jfif", title: "Palco & Iluminação de Festival" },
      { id: 3, url: "assets/logo-sonovolt.jpg", title: "Estruturas Box Truss & Áudio" },
      { id: 4, url: "assets/hero-banner.jfif", title: "Montagem Técnica & Operação" }
    ]
  },

  // 📸 Galeria de Fotos e Vídeos (Mínimo de 10 itens já incluídos)
  portfolio: [
    {
      id: 1,
      type: "image",
      title: "Festival de Música & Palco Principal",
      category: "festival",
      tag: "FESTIVAL / SHOW",
      badge: "DESTAQUE",
      desc: "Sonorização pesada com sistema Line Array completo, iluminação com moving heads e grid em Box Truss para mais de 5 mil pessoas.",
      date: "Vale do Paraíba",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    },
    {
      id: 2,
      type: "video",
      title: "Bastidores & Montagem de Infraestrutura",
      category: "festival",
      tag: "VÍDEO / BASTIDORES",
      badge: "VÍDEO 🎬",
      desc: "Veja como funciona o trabalho de montagem, passagem de som e alinhamento acústico realizado pela equipe técnica SONOVOLT.",
      date: "Ação Técnica",
      location: "Vale do Paraíba",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    },
    {
      id: 3,
      type: "image",
      title: "Convenção Empresarial & Painéis de LED",
      category: "corporativo",
      tag: "CORPORATIVO",
      badge: "NOVO",
      desc: "Sonorização de alta clareza sem microfonias, microfones sem fio de resposta rápida e iluminação ambiental sob medida.",
      date: "Centro de Convenções",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/hero-banner.jfif",
      videoUrl: ""
    },
    {
      id: 4,
      type: "image",
      title: "Mega Baile de Formatura & Gala",
      category: "formatura",
      tag: "FORMATURA",
      badge: "DESTAQUE",
      desc: "Palco com praticáveis para os formandos, iluminação cenográfica de pista de dança com efeitos especiais e som potente.",
      date: "Clube Social",
      location: "Vale do Paraíba",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    },
    {
      id: 5,
      type: "image",
      title: "Casamento Especial & Celebração ao Ar Livre",
      category: "casamento",
      tag: "CASAMENTO / SOCIAL",
      badge: "",
      desc: "Iluminação decorativa aconchegante, sonorização acústica limpa para cerimônia religiosa e som de pista de dança para DJ.",
      date: "Espaço de Festas",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/hero-banner.jfif",
      videoUrl: ""
    },
    {
      id: 6,
      type: "image",
      title: "Show Público em Praça Aberta",
      category: "publico",
      tag: "EVENTO PÚBLICO",
      badge: "",
      desc: "Estrutura para grande circulação de pessoas, palco coberto, gerador e sonorização distribuída por todo o recinto.",
      date: "Praça Central",
      location: "Região do Vale",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    },
    {
      id: 7,
      type: "image",
      title: "Grid Aéreo Box Truss & Moving Heads",
      category: "festival",
      tag: "ESTRUTURA / ILUMINAÇÃO",
      badge: "NOVO",
      desc: "Montagem de estrutura metálica suspensa com refletores, moving heads e strobo para festival eletrônico.",
      date: "Arena Musical",
      location: "Vale do Paraíba",
      mediaUrl: "assets/hero-banner.jfif",
      videoUrl: ""
    },
    {
      id: 8,
      type: "image",
      title: "Encontro Corporativo & Premiação",
      category: "corporativo",
      tag: "CORPORATIVO",
      badge: "",
      desc: "Infraestrutura audiovisual integrada, telão central e microfones de lapela para diretores e convidados.",
      date: "Hotel Fazenda",
      location: "Região do Vale",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    },
    {
      id: 9,
      type: "image",
      title: "Aniversário & Festa Fechada VIP",
      category: "fechado",
      tag: "EVENTO FECHADO",
      badge: "",
      desc: "Pista de dança equipada com som de graves profundos, iluminação laser e máquina de fumaça profissional.",
      date: "Residência Privada",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/hero-banner.jfif",
      videoUrl: ""
    },
    {
      id: 10,
      type: "image",
      title: "Colação de Grau Acadêmica",
      category: "formatura",
      tag: "FORMATURA",
      badge: "",
      desc: "Sonorização balanceada para discursos solenes, hinos e passagem de alunos, com iluminação frontal impecável.",
      date: "Teatro Municipal",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    },
    {
      id: 11,
      type: "image",
      title: "Rider Técnico Completo para Banda",
      category: "festival",
      tag: "SHOW / BACKLINE",
      badge: "RIDER",
      desc: "Fornecimento de amplificadores, bateria, microfonia Shure/Sennheiser e sistema de monitoração in-ear.",
      date: "Palco de Festival",
      location: "Vale do Paraíba",
      mediaUrl: "assets/hero-banner.jfif",
      videoUrl: ""
    },
    {
      id: 12,
      type: "image",
      title: "Casamento Noturno & Pista de Led",
      category: "casamento",
      tag: "CASAMENTO / SOCIAL",
      badge: "NOVO",
      desc: "Cenografia com luzes quentes e pista de dança de LED de alta resistência para os noivos e convidados.",
      date: "Villa Real",
      location: "Guaratinguetá - SP",
      mediaUrl: "assets/logo-sonovolt.jpg",
      videoUrl: ""
    }
  ]
};
