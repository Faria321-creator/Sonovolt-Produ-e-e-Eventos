/**
 * ==========================================================================
 * SONOVOLT Produções e Eventos - Sistema de Gestão & Produção (app.js)
 * Inclui: Criador de Site Visual Estilo Wix (CMS com Publicação Imediata)
 * ==========================================================================
 */

const DBKEY = 'sonovolt_producao_v1';
const PUBLISHED_SITE_KEY = 'sonovolt_published_site';

const initialDB = {
  events: [],
  tasks: [],
  team: [],
  suppliers: [],
  equipment: [],
  expenses: [],
  stage: [],
  checklist: []
};

let db = loadDB();
let currentPage = 'dashboard';
let builderTab = 'identity';
let searchTerm = '';
let editId = null;
let formType = '';
let stageSelected = null;

// Dados em edição no Criador de Site
let siteDraft = loadSiteDraft();

// Sistema de Autenticação / Proteção por Senha
function checkAuth() {
  const isAuth = sessionStorage.getItem("sonovolt_authenticated") === "true";
  const loginScreen = document.getElementById("loginScreen");
  const appMain = document.getElementById("appMain");

  if (!isAuth) {
    if (loginScreen) loginScreen.style.display = "flex";
    if (appMain) appMain.style.display = "none";
    initPanelLoginForm();
    return false;
  } else {
    if (loginScreen) loginScreen.style.display = "none";
    if (appMain) appMain.style.display = "grid";
    return true;
  }
}

function initPanelLoginForm() {
  const form = document.getElementById("panelLoginForm");
  const err = document.getElementById("loginError");
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById("panelUser").value.trim().toLowerCase();
    const p = document.getElementById("panelPass").value.trim();

    if ((u === "sonovolt" || u === "admin") && (p === "sonovolt2026" || p === "123456")) {
      sessionStorage.setItem("sonovolt_authenticated", "true");
      sessionStorage.setItem("sonovolt_user", u);
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("appMain").style.display = "grid";
      render();
      toast("Bem-vindo ao Painel SONOVOLT!");
    } else {
      if (err) err.style.display = "block";
    }
  };
}

function logout() {
  if (!confirm("Deseja realmente sair da área restrita?")) return;
  sessionStorage.removeItem("sonovolt_authenticated");
  sessionStorage.removeItem("sonovolt_user");
  window.location.reload();
}

// Persistência local (LocalStorage)
function loadDB() {
  try {
    const legacy = localStorage.getItem('eventra_producao_v1');
    const current = localStorage.getItem(DBKEY);
    const raw = current || legacy || '{}';
    return { ...structuredClone(initialDB), ...JSON.parse(raw) };
  } catch (e) {
    return structuredClone(initialDB);
  }
}

function saveDB() {
  localStorage.setItem(DBKEY, JSON.stringify(db));
}

// Carrega o rascunho do site (do publicado ou do data.js)
function loadSiteDraft() {
  try {
    const saved = localStorage.getItem(PUBLISHED_SITE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  if (typeof SONOVOLT_CONFIG !== 'undefined') {
    return structuredClone(SONOVOLT_CONFIG);
  }

  return {
    company: {
      name: "SONOVOLT",
      tagline: "PRODUÇÕES & EVENTOS",
      email: "sonovolt@gmail.com",
      phone: "(12) 98183-0623",
      whatsappLink: "https://wa.me/5512981830623",
      location: "Guaratinguetá-SP • Vale do Paraíba",
      logo: "assets/logo-sonovolt.jpg",
      social: {
        instagram: "https://instagram.com/sonovolteventos",
        facebook: "https://facebook.com/sonovolteventos"
      }
    },
    hero: {
      eyebrow: "Guaratinguetá-SP • Vale do Paraíba",
      title: "Seu evento com a máxima<br><span class=\"gradient\">potência & estrutura.</span>",
      desc: "Somos agentes de eventos especialistas em infraestrutura completa: montagem, desmontagem técnica, locação de som profissional, iluminação cênica, palcos, painéis de LED e estruturas para festivais, eventos corporativos, públicos, fechados, casamentos e formaturas."
    },
    services: [],
    portfolio: []
  };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtDate(d) {
  if (!d) return '—';
  let x = new Date(d + 'T12:00:00');
  return isNaN(x) ? d : x.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function shortDate(d) {
  if (!d) return { day: '—', mon: '—' };
  let x = new Date(d + 'T12:00:00');
  return { day: x.getDate(), mon: x.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') };
}

function money(n) {
  return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function statusPill(s) {
  let c = s === 'Confirmado' || s === 'Concluído' || s === 'Pago' ? 'green' :
          s === 'Em andamento' || s === 'Pendente' ? 'yellow' :
          s === 'Cancelado' || s === 'Atrasado' ? 'red' : '';
  return `<span class="pill ${c}">${esc(s || 'Planejamento')}</span>`;
}

function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

function toggleMenu() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

// Navegação de páginas
const pageTitles = {
  dashboard: ['Visão Geral', 'Painel de Produção & Gestão'],
  site_builder: ['Redes & Contatos', 'Redes Sociais, Contato & Dados da Empresa'],
  events: ['Agenda de Eventos', 'Agenda de Produção & Shows'],
  timeline: ['Cronograma', 'Cronograma Operacional & Passagem de Som'],
  checklist: ['Checklist', 'Checklist Técnico de Montagem'],
  team: ['Equipe', 'Equipe Técnica & Operadores'],
  suppliers: ['Fornecedores', 'Parceiros & Fornecedores'],
  equipment: ['Equipamentos', 'Inventário de Som, Luz & Estruturas'],
  budget: ['Orçamento', 'Controle de Custos & Despesas'],
  stage: ['Mapa de Palco', 'Stage Plot & Disposição'],
  reports: ['Relatórios', 'Relatórios & Backup']
};

document.getElementById('nav')?.addEventListener('click', e => {
  let b = e.target.closest('button[data-page]');
  if (b) go(b.dataset.page);
});

function go(p) {
  currentPage = p;
  searchTerm = '';
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.page === p));
  const crumbEl = document.getElementById('crumb');
  const titleEl = document.getElementById('topTitle');
  if (crumbEl && pageTitles[p]) crumbEl.textContent = pageTitles[p][0];
  if (titleEl && pageTitles[p]) titleEl.textContent = pageTitles[p][1];
  document.getElementById('sidebar')?.classList.remove('open');
  render();
}

function render() {
  let c = document.getElementById('content');
  if (!c) return;

  if (currentPage === 'dashboard') c.innerHTML = dashboardView();
  else if (currentPage === 'site_builder') c.innerHTML = siteBuilderView();
  else if (currentPage === 'events') c.innerHTML = eventsPage();
  else if (currentPage === 'timeline') c.innerHTML = timelinePage();
  else if (currentPage === 'checklist') c.innerHTML = checklistPage();
  else if (currentPage === 'team') c.innerHTML = genericPage('team');
  else if (currentPage === 'suppliers') c.innerHTML = genericPage('suppliers');
  else if (currentPage === 'equipment') c.innerHTML = genericPage('equipment');
  else if (currentPage === 'budget') c.innerHTML = budgetPage();
  else if (currentPage === 'stage') {
    c.innerHTML = stagePage();
    bindStageDrag();
  }
  else if (currentPage === 'reports') c.innerHTML = reportsPage();
}

// --------------------------------------------------
// Página: Dashboard / Visão Geral
// --------------------------------------------------
function dashboardView() {
  let upcoming = [...db.events]
    .filter(e => e.date >= today() && e.status !== 'Cancelado')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  let pending = db.tasks.filter(t => !t.done).slice(0, 5);
  let month = db.events.filter(e => e.date && e.date.slice(0, 7) === today().slice(0, 7)).length;
  let spent = db.expenses.reduce((s, x) => s + Number(x.amount || 0), 0);

  return `
    <div class="welcome">
      <div>
        <h1>SONOVOLT Produções & Eventos ⚡</h1>
        <p>Base Guaratinguetá-SP • Controle de infraestrutura, logística de montagem e cronograma de shows.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn" onclick="go('site_builder')" style="color:var(--accent2); border-color:var(--accent)">🌐 Redes Sociais & Contato</button>
        <button class="btn primary" onclick="openEventModal()">＋ Novo Evento</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-head">Eventos Cadastrados <span class="stat-icon">▣</span></div>
        <strong>${db.events.length}</strong>
        <small>Total na agenda</small>
      </div>
      <div class="stat">
        <div class="stat-head">Programados no Mês <span class="stat-icon">▦</span></div>
        <strong>${month}</strong>
        <small>Eventos ativos</small>
      </div>
      <div class="stat">
        <div class="stat-head">Tarefas Pendentes <span class="stat-icon">☑</span></div>
        <strong>${db.tasks.filter(t => !t.done).length + db.checklist.filter(t => !t.done).length}</strong>
        <small>Itens operacionais</small>
      </div>
      <div class="stat">
        <div class="stat-head">Despesas Lançadas <span class="stat-icon">＄</span></div>
        <strong style="font-size:22px">${money(spent)}</strong>
        <small>Total registrado</small>
      </div>
    </div>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Próximas Montagens & Shows</h3>
            <p>Eventos com datas confirmadas no Vale do Paraíba</p>
          </div>
          <button class="btn small" onclick="go('events')">Ver Agenda Completa →</button>
        </div>
        <div class="event-list">
          ${upcoming.length ? upcoming.map(e => {
            let d = shortDate(e.date);
            return `
              <div class="event-row">
                <div class="datebox"><b>${d.day}</b><small>${d.mon}</small></div>
                <div>
                  <h4>${esc(e.name)}</h4>
                  <p>⌖ ${esc(e.location || 'Local a definir')} · ${esc(e.time || 'Horário a definir')}</p>
                </div>
                ${statusPill(e.status)}
              </div>
            `;
          }).join('') : '<div class="empty"><b>Nenhum evento próximo</b>Cadastre seu primeiro evento para começar a organizar a equipe.</div>'}
        </div>
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Foco da Produção</h3>
            <p>Tarefas pendentes e checagens</p>
          </div>
          <button class="btn small" onclick="go('checklist')">Checklist Técnico →</button>
        </div>
        <div class="task-list">
          ${pending.length ? pending.map(t => `
            <label class="task">
              <input type="checkbox" onchange="toggleTask('${t.id}', this.checked)">
              <span>${esc(t.title)}<small>${esc(t.event || 'Geral')} · ${fmtDate(t.date)}</small></span>
            </label>
          `).join('') : '<div class="empty"><b>Tudo alinhado!</b>Nenhuma tarefa imediata pendente.</div>'}
        </div>
      </section>
    </div>

    <div class="panel" style="margin-top: 18px">
      <div class="panel-head">
        <div>
          <h3>Ferramentas de Produção & Site</h3>
          <p>Acesse rapidamente os módulos operacionais e de divulgação</p>
        </div>
      </div>
      <div class="toolbar">
        <button class="btn" onclick="go('site_builder')">🎨 Criador de Site (Estilo Wix)</button>
        <button class="btn" onclick="go('timeline')">◷ Cronograma & Passagem</button>
        <button class="btn" onclick="go('equipment')">▤ Equipamentos & Riders</button>
        <button class="btn" onclick="go('budget')">＄ Orçamento & Despesas</button>
        <button class="btn" onclick="go('stage')">▱ Mapa de Palco (Plot)</button>
        <button class="btn" onclick="go('reports')">▥ Relatórios & PDF</button>
      </div>
    </div>
    <div class="footer-note">SONOVOLT Produções e Eventos • Potência e Estrutura Profissional em Guaratinguetá-SP.</div>
  `;
}

// --------------------------------------------------
// 🎨 CRIADOR DE SITE VISUAL (ESTILO WIX COM CMS)
// --------------------------------------------------
function siteBuilderView() {
  const d = siteDraft;
  const comp = d.company || {};
  const soc = comp.social || {};
  const hero = d.hero || {};
  const servs = d.services || [];
  const ports = d.portfolio || [];

  return `
    <!-- Barra Superior de Publicação (Estilo Wix) -->
    <div class="builder-bar">
      <div>
        <h2 style="font-size: 19px; margin: 0 0 4px; color:#fff;">🌐 Redes Sociais, Contatos & Configurações SONOVOLT</h2>
        <p style="margin: 0; color: var(--muted); font-size: 12px;">Edite as fotos, textos, redes sociais e vídeos. Depois clique em <b>Publicar</b> para atualizar seu site na hora!</p>
      </div>
      <div class="builder-bar-actions">
        <a class="btn" href="index.html" target="_blank" title="Ver como o site está agora">👁️ Ver Site Ao Vivo</a>
        <button class="btn" onclick="exportDataJs()">📥 Baixar data.js</button>
        <button class="btn publish" onclick="publishSite()">🚀 PUBLICAR SITE ATUALIZADO</button>
      </div>
    </div>

    <!-- Abas de Navegação do Editor -->
    <div class="builder-tabs">
      <button class="builder-tab-btn ${builderTab === 'identity' ? 'active' : ''}" onclick="setBuilderTab('identity')">📱 Contatos & Redes Sociais</button>
      <button class="builder-tab-btn ${builderTab === 'hero' ? 'active' : ''}" onclick="setBuilderTab('hero')">⚡ Banner Principal (Hero)</button>
      <button class="builder-tab-btn ${builderTab === 'services' ? 'active' : ''}" onclick="setBuilderTab('services')">🛠️ Serviços (${servs.length})</button>
      <button class="builder-tab-btn ${builderTab === 'portfolio' ? 'active' : ''}" onclick="setBuilderTab('portfolio')">📸 Fotos & Vídeos (${ports.length})</button>
    </div>

    <!-- Conteúdo da Aba Ativa -->
    <div class="panel">
      ${builderTab === 'identity' ? renderBuilderIdentity(comp, soc) : ''}
      ${builderTab === 'hero' ? renderBuilderHero(hero) : ''}
      ${builderTab === 'services' ? renderBuilderServices(servs) : ''}
      ${builderTab === 'portfolio' ? renderBuilderPortfolio(ports) : ''}
    </div>
  `;
}

function setBuilderTab(tab) {
  builderTab = tab;
  render();
}

// 1. Aba: Contatos e Redes Sociais
function renderBuilderIdentity(comp, soc) {
  return `
    <div class="panel-head">
      <div>
        <h3>Identidade, Contatos e Redes Sociais</h3>
        <p>Defina o Instagram, Facebook, WhatsApp e dados da empresa que aparecem no site.</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="field">
        <label>Nome da Empresa</label>
        <input value="${esc(comp.name || 'SONOVOLT')}" oninput="siteDraft.company.name=this.value">
      </div>
      <div class="field">
        <label>Slogan / Subtítulo</label>
        <input value="${esc(comp.tagline || 'PRODUÇÕES & EVENTOS')}" oninput="siteDraft.company.tagline=this.value">
      </div>

      <div class="field">
        <label>Telefone / WhatsApp</label>
        <input value="${esc(comp.phone || '(12) 98183-0623')}" oninput="siteDraft.company.phone=this.value; siteDraft.company.whatsapp=this.value;">
      </div>
      <div class="field">
        <label>Link Direto do WhatsApp</label>
        <input value="${esc(comp.whatsappLink || 'https://wa.me/5512981830623')}" oninput="siteDraft.company.whatsappLink=this.value">
      </div>

      <div class="field">
        <label>E-mail Oficial</label>
        <input value="${esc(comp.email || 'sonovolt@gmail.com')}" oninput="siteDraft.company.email=this.value">
      </div>
      <div class="field">
        <label>Localização / Base Regional</label>
        <input value="${esc(comp.location || 'Guaratinguetá-SP • Vale do Paraíba')}" oninput="siteDraft.company.location=this.value">
      </div>

      <div class="field span2" style="border-top: 1px solid var(--line); padding-top: 16px; margin-top: 6px;">
        <h4 style="color: var(--accent2); margin-bottom: 12px;">Redes Sociais Oficiais</h4>
      </div>

      <div class="field">
        <label>Instagram (Link Completo)</label>
        <input placeholder="https://www.instagram.com/seu_perfil" value="${esc(soc.instagram || '')}" oninput="if(!siteDraft.company.social)siteDraft.company.social={}; siteDraft.company.social.instagram=this.value;">
      </div>
      <div class="field">
        <label>Instagram (@arroba)</label>
        <input placeholder="@sonovolteventos" value="${esc(soc.instagramHandle || '')}" oninput="if(!siteDraft.company.social)siteDraft.company.social={}; siteDraft.company.social.instagramHandle=this.value;">
      </div>

      <div class="field">
        <label>Facebook (Link Completo)</label>
        <input placeholder="https://www.facebook.com/sua_pagina" value="${esc(soc.facebook || '')}" oninput="if(!siteDraft.company.social)siteDraft.company.social={}; siteDraft.company.social.facebook=this.value;">
      </div>
      <div class="field">
        <label>Facebook (Nome de Exibição)</label>
        <input placeholder="SONOVOLT Produções" value="${esc(soc.facebookName || '')}" oninput="if(!siteDraft.company.social)siteDraft.company.social={}; siteDraft.company.social.facebookName=this.value;">
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <button class="btn publish" onclick="publishSite()">Salvar e Publicar Alterações 🚀</button>
    </div>
  `;
}

// 2. Aba: Banner Principal (Hero)
function renderBuilderHero(hero) {
  if (!siteDraft.hero) siteDraft.hero = {};

  return `
    <div class="panel-head">
      <div>
        <h3>Banner Principal (Hero)</h3>
        <p>Personalize os títulos e textos de boas-vindas do topo do site.</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="field span2">
        <label>Selo / Tag Superior</label>
        <input value="${esc(hero.eyebrow || 'Guaratinguetá-SP • Vale do Paraíba')}" oninput="siteDraft.hero.eyebrow=this.value">
      </div>

      <div class="field span2">
        <label>Título Principal</label>
        <textarea style="min-height: 70px;" oninput="siteDraft.hero.title=this.value">${esc(hero.title || 'Seu evento com a máxima<br><span class="gradient">potência & estrutura.</span>')}</textarea>
        <small class="muted">Dica: use <code>&lt;br&gt;</code> para quebrar linha e <code>&lt;span class="gradient"&gt;texto&lt;/span&gt;</code> para o efeito azul neon.</small>
      </div>

      <div class="field span2">
        <label>Texto de Apresentação / Descrição</label>
        <textarea style="min-height: 90px;" oninput="siteDraft.hero.desc=this.value">${esc(hero.desc || '')}</textarea>
      </div>
    </div>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
      <button class="btn publish" onclick="publishSite()">Salvar e Publicar Alterações 🚀</button>
    </div>
  `;
}

// 3. Aba: Serviços & Infraestrutura
function renderBuilderServices(servs) {
  return `
    <div class="panel-head">
      <div>
        <h3>Serviços & Infraestrutura Oferecida</h3>
        <p>Altere os textos dos 6 blocos de serviços ou adicione novos equipamentos.</p>
      </div>
      <button class="btn primary" onclick="addNewServiceDraft()">＋ Adicionar Serviço</button>
    </div>

    <div>
      ${servs.map((s, idx) => `
        <div class="builder-card-item">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <b style="color:var(--accent2); font-size:15px;">#${idx + 1} — ${esc(s.title)}</b>
            <button class="btn small danger" onclick="removeServiceDraft(${idx})">Remover</button>
          </div>
          <div class="form-grid">
            <div class="field" style="max-width: 120px;">
              <label>Ícone</label>
              <input value="${esc(s.icon || '⚡')}" oninput="siteDraft.services[${idx}].icon=this.value">
            </div>
            <div class="field" style="flex:1;">
              <label>Título do Serviço</label>
              <input value="${esc(s.title)}" oninput="siteDraft.services[${idx}].title=this.value">
            </div>
            <div class="field span2">
              <label>Descrição do Serviço</label>
              <textarea oninput="siteDraft.services[${idx}].desc=this.value">${esc(s.desc)}</textarea>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn" onclick="addNewServiceDraft()">＋ Adicionar Mais Um Serviço</button>
      <button class="btn publish" onclick="publishSite()">Salvar e Publicar Alterações 🚀</button>
    </div>
  `;
}

function addNewServiceDraft() {
  if (!siteDraft.services) siteDraft.services = [];
  siteDraft.services.push({
    id: uid(),
    icon: '⚡',
    title: 'Novo Serviço de Infraestrutura',
    desc: 'Descreva os equipamentos, qualidade e vantagens oferecidas para este serviço.',
    items: ['Item técnico 1', 'Item técnico 2']
  });
  render();
}

function removeServiceDraft(idx) {
  if (!confirm('Deseja remover este serviço?')) return;
  siteDraft.services.splice(idx, 1);
  render();
}

// 4. Aba: Fotos & Vídeos (Galeria Dinâmica)
function renderBuilderPortfolio(ports) {
  return `
    <div class="panel-head">
      <div>
        <h3>Galeria de Fotos & Vídeos do Portfólio</h3>
        <p>Adicione fotos ou vídeos do YouTube das suas montagens para exibir no site.</p>
      </div>
      <button class="btn primary" onclick="addNewPortfolioDraft()">＋ Adicionar Foto ou Vídeo</button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
      ${ports.map((p, idx) => `
        <div class="builder-card-item">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span class="pill ${p.type === 'video' ? 'yellow' : 'green'}">${p.type === 'video' ? '🎬 Vídeo' : '📷 Foto'}</span>
            <button class="btn small danger" onclick="removePortfolioDraft(${idx})">Excluir</button>
          </div>

          <div class="field">
            <label>Título do Evento</label>
            <input value="${esc(p.title)}" oninput="siteDraft.portfolio[${idx}].title=this.value">
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Tipo</label>
              <select onchange="siteDraft.portfolio[${idx}].type=this.value; render();">
                <option value="image" ${p.type !== 'video' ? 'selected' : ''}>📷 Foto</option>
                <option value="video" ${p.type === 'video' ? 'selected' : ''}>🎬 Vídeo</option>
              </select>
            </div>
            <div class="field">
              <label>Categoria</label>
              <select onchange="siteDraft.portfolio[${idx}].category=this.value">
                ${opts(['festival', 'corporativo', 'publico', 'formatura', 'casamento', 'fechado'], p.category || 'festival')}
              </select>
            </div>
          </div>

          ${p.type === 'video' ? `
            <div class="field">
              <label>Link do Vídeo (YouTube)</label>
              <input placeholder="https://www.youtube.com/watch?v=..." value="${esc(p.videoUrl || '')}" oninput="siteDraft.portfolio[${idx}].videoUrl=this.value">
            </div>
          ` : `
            <div class="field">
              <label>Foto do Evento</label>
              <input placeholder="assets/foto.jpg ou link da web" value="${esc(p.mediaUrl || p.image || '')}" oninput="siteDraft.portfolio[${idx}].mediaUrl=this.value; siteDraft.portfolio[${idx}].image=this.value;">
              
              <!-- Upload do Computador -->
              <div style="margin-top: 6px;">
                <label class="btn small" style="cursor:pointer; width:100%; text-align:center;">
                  📁 Escolher foto do meu computador
                  <input type="file" accept="image/*" style="display:none" onchange="handleImageUpload(event, ${idx})">
                </label>
              </div>
            </div>
          `}

          ${(p.mediaUrl || p.image) ? `
            <img src="${p.mediaUrl || p.image}" class="builder-preview-img" alt="Preview">
          ` : ''}

          <div class="field" style="margin-top: 10px;">
            <label>Descrição do Trabalho</label>
            <textarea style="min-height: 60px;" oninput="siteDraft.portfolio[${idx}].desc=this.value">${esc(p.desc || '')}</textarea>
          </div>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn" onclick="addNewPortfolioDraft()">＋ Adicionar Mais Um Item</button>
      <button class="btn publish" onclick="publishSite()">Salvar e Publicar Alterações 🚀</button>
    </div>
  `;
}

function handleImageUpload(ev, idx) {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    siteDraft.portfolio[idx].mediaUrl = reader.result;
    siteDraft.portfolio[idx].image = reader.result;
    render();
    toast('Foto carregada com sucesso! Clique em Publicar para aplicar ao site.');
  };
  reader.readAsDataURL(file);
}

function addNewPortfolioDraft() {
  if (!siteDraft.portfolio) siteDraft.portfolio = [];
  siteDraft.portfolio.unshift({
    id: uid(),
    type: 'image',
    title: 'Novo Show ou Evento Realizado',
    category: 'festival',
    tag: 'FESTIVAL / SHOW',
    badge: 'NOVO',
    desc: 'Montagem de estrutura, sonorização Line Array e iluminação cênica de alta performance.',
    date: 'Guaratinguetá - SP',
    location: 'Vale do Paraíba',
    mediaUrl: 'assets/logo-sonovolt.jpg',
    videoUrl: ''
  });
  render();
}

function removePortfolioDraft(idx) {
  if (!confirm('Deseja excluir este item do portfólio?')) return;
  siteDraft.portfolio.splice(idx, 1);
  render();
}

// 🚀 AÇÃO DE PUBLICAR (Salva no navegador e aplica no site imediatamente)
function publishSite() {
  localStorage.setItem(PUBLISHED_SITE_KEY, JSON.stringify(siteDraft));
  toast('🚀 SITE PUBLICADO COM SUCESSO! As alterações já estão visíveis no site.');
}

// Exporta o arquivo data.js atualizado caso o usuário queira baixar
function exportDataJs() {
  const content = `/**
 * ==========================================================================
 * SONOVOLT Produções e Eventos - Dados Atualizados pelo Criador de Site
 * ==========================================================================
 * Gerado em: ${new Date().toLocaleString('pt-BR')}
 */

const SONOVOLT_CONFIG = ${JSON.stringify(siteDraft, null, 2)};
`;

  const blob = new Blob([content], { type: 'application/javascript' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.js';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Arquivo data.js baixado com sucesso!');
}

// --------------------------------------------------
// Página: Agenda de Eventos
// --------------------------------------------------
function eventsPage() {
  let rows = db.events
    .filter(e => (e.name + ' ' + e.location + ' ' + e.client + ' ' + e.type).toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return `
    <div class="section-title">
      <div>
        <h1>Agenda de Eventos & Produções</h1>
        <p>Cadastre datas, locais, clientes e status das montagens da SONOVOLT.</p>
      </div>
      <button class="btn primary" onclick="openEventModal()">＋ Novo Evento</button>
    </div>

    <div class="toolbar">
      <input placeholder="⌕ Buscar evento, cliente ou local..." value="${esc(searchTerm)}" oninput="searchTerm=this.value;render()">
      <select onchange="filterEventStatus(this.value)" id="statusFilter">
        <option value="">Todos os status</option>
        <option>Planejamento</option>
        <option>Confirmado</option>
        <option>Em andamento</option>
        <option>Concluído</option>
        <option>Cancelado</option>
      </select>
      <button class="btn" onclick="window.print()">⎙ Imprimir Agenda</button>
    </div>

    <div class="panel">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Data e Horário</th>
              <th>Local / Cidade</th>
              <th>Cliente / Contratante</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="eventsRows">
            ${rows.length ? rows.map(e => eventRow(e)).join('') : '<tr><td colspan="6"><div class="empty"><b>Sua agenda está vazia</b>Cadastre um evento para iniciar.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function eventRow(e) {
  return `
    <tr data-status="${esc(e.status)}">
      <td><strong>${esc(e.name)}</strong><div class="muted">${esc(e.type || 'Evento')}</div></td>
      <td>${fmtDate(e.date)}<div class="muted">${esc(e.time || '—')}</div></td>
      <td>${esc(e.location || '—')}</td>
      <td>${esc(e.client || '—')}</td>
      <td>${statusPill(e.status)}</td>
      <td>
        <div class="actions">
          <button class="btn small" onclick="editRecord('events', '${e.id}')">Editar</button>
          <button class="btn small danger" onclick="delRecord('events', '${e.id}')">Excluir</button>
        </div>
      </td>
    </tr>
  `;
}

function filterEventStatus(v) {
  document.querySelectorAll('#eventsRows tr[data-status]').forEach(r => {
    r.style.display = !v || r.dataset.status === v ? '' : 'none';
  });
}

function openEventModal(id) {
  let e = id ? db.events.find(x => x.id === id) : {};
  editId = id || null;
  formType = 'events';

  let body = `
    <div class="form-grid">
      <div class="field span2"><label>Nome do Evento *</label><input name="name" required value="${esc(e.name || '')}" placeholder="Ex.: Festival Rock Vale 2026"></div>
      <div class="field"><label>Data do Evento *</label><input name="date" type="date" required value="${esc(e.date || '')}"></div>
      <div class="field"><label>Horário de Início</label><input name="time" type="time" value="${esc(e.time || '')}"></div>
      <div class="field"><label>Tipo de Evento</label><select name="type">${opts(['Festival / Show', 'Corporativo', 'Evento Público', 'Casamento / Social', 'Formatura', 'Evento Fechado', 'Locação de Rider', 'Outro'], e.type || 'Festival / Show')}</select></div>
      <div class="field"><label>Status</label><select name="status">${opts(['Planejamento', 'Confirmado', 'Em andamento', 'Concluído', 'Cancelado'], e.status || 'Planejamento')}</select></div>
      <div class="field"><label>Contratante / Empresa</label><input name="client" value="${esc(e.client || '')}" placeholder="Nome do cliente"></div>
      <div class="field"><label>Técnico Responsável</label><input name="manager" value="${esc(e.manager || '')}" placeholder="Produtor / Técnico SONOVOLT"></div>
      <div class="field span2"><label>Local / Endereço</label><input name="location" value="${esc(e.location || '')}" placeholder="Cidade, espaço ou endereço do evento"></div>
      <div class="field span2"><label>Especificações do Rider / Observações</label><textarea name="notes" placeholder="Detalhes de som, iluminação, praticáveis, gerador, etc.">${esc(e.notes || '')}</textarea></div>
    </div>
  `;

  showModal(id ? 'Editar Evento' : 'Novo Evento', body, () => saveEvent());
}

function saveEvent() {
  let f = formValues();
  if (!f.name || !f.date) {
    toast('Preencha o nome e a data do evento.');
    return false;
  }
  if (editId) {
    db.events = db.events.map(e => e.id === editId ? { ...e, ...f } : e);
  } else {
    db.events.push({ id: uid(), ...f, created: today() });
  }
  saveDB();
  closeModal();
  render();
  toast('Evento salvo com sucesso!');
  return true;
}

// --------------------------------------------------
// Modais Genéricos & CRUD Helpers
// --------------------------------------------------
function opts(arr, selected) {
  return arr.map(x => `<option ${x === selected ? 'selected' : ''}>${esc(x)}</option>`).join('');
}

function formValues() {
  let out = {};
  document.querySelectorAll('#modalBody [name]').forEach(el => out[el.name] = el.value.trim());
  return out;
}

function showModal(title, body, onSave, saveLabel = 'Salvar') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = body;
  document.getElementById('modalFoot').innerHTML = `
    <button class="btn" onclick="closeModal()">Cancelar</button>
    <button class="btn primary" id="modalSave">${saveLabel}</button>
  `;
  document.getElementById('modalSave').onclick = onSave;
  document.getElementById('modalBackdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modalBackdrop').classList.remove('open');
  editId = null;
  formType = '';
}

function backdropClose(e) {
  if (e.target.id === 'modalBackdrop') closeModal();
}

function editRecord(type, id) {
  if (type === 'events') return openEventModal(id);
  let rec = db[type].find(x => x.id === id);
  if (!rec) return;
  openGenericModal(type, rec);
}

function delRecord(type, id) {
  if (!confirm('Excluir este registro?')) return;
  db[type] = db[type].filter(x => x.id !== id);
  saveDB();
  render();
  toast('Registro excluído.');
}

// --------------------------------------------------
// Equipe, Fornecedores e Equipamentos
// --------------------------------------------------
function genericConfig(type) {
  return {
    team: {
      title: 'Profissional da Equipe',
      fields: [['name', 'Nome Completo', 'text'], ['role', 'Especialidade / Função', 'text'], ['phone', 'Telefone / WhatsApp', 'tel'], ['email', 'E-mail', 'email'], ['event', 'Evento Escalado', 'event'], ['notes', 'Observações', 'textarea']],
      cols: ['Nome', 'Função', 'Contato', 'Evento Escalado']
    },
    suppliers: {
      title: 'Fornecedor / Parceiro',
      fields: [['name', 'Nome / Empresa', 'text'], ['category', 'Segmento', 'text'], ['contact', 'Pessoa de Contato', 'text'], ['phone', 'Telefone / WhatsApp', 'tel'], ['email', 'E-mail', 'email'], ['notes', 'Observações', 'textarea']],
      cols: ['Empresa', 'Segmento', 'Contato', 'Telefone']
    },
    equipment: {
      title: 'Equipamento / Material',
      fields: [['name', 'Equipamento', 'text'], ['category', 'Categoria', 'category'], ['qty', 'Quantidade em Estoque', 'number'], ['condition', 'Disponibilidade', 'condition'], ['event', 'Alocado no Evento', 'event'], ['notes', 'Observações / Especificação', 'textarea']],
      cols: ['Equipamento', 'Categoria', 'Qtd', 'Status']
    }
  }[type];
}

function genericPage(type) {
  let cfg = genericConfig(type);
  let arr = db[type].filter(x => JSON.stringify(x).toLowerCase().includes(searchTerm.toLowerCase()));

  return `
    <div class="section-title">
      <div>
        <h1>${type === 'team' ? 'Equipe Técnica' : type === 'suppliers' ? 'Fornecedores & Parceiros' : 'Equipamentos & Riders'}</h1>
        <p>${type === 'team' ? 'Técnicos de som, iluminação, roadies e carregadores.' : type === 'suppliers' ? 'Geradores, empresas de tendas, segurança e parceiros do Vale.' : 'Controle de caixas Line Array, moving heads, microfones, mesas e cabos.'}</p>
      </div>
      <button class="btn primary" onclick="openGenericModal('${type}')">＋ Adicionar</button>
    </div>

    <div class="toolbar">
      <input placeholder="⌕ Buscar..." value="${esc(searchTerm)}" oninput="searchTerm=this.value;render()">
      <button class="btn" onclick="window.print()">⎙ Imprimir</button>
    </div>

    <div class="panel">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${cfg.cols.map(c => `<th>${c}</th>`).join('')}
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${arr.length ? arr.map(x => `
              <tr>
                ${(type === 'team' ? [
                  `<strong>${esc(x.name)}</strong>`,
                  `${esc(x.role || '—')}`,
                  `${esc(x.phone || '—')}<div class="muted">${esc(x.email || '')}</div>`,
                  esc(x.event || '—')
                ] : type === 'suppliers' ? [
                  `<strong>${esc(x.name)}</strong>`,
                  `${esc(x.category || '—')}`,
                  `${esc(x.contact || '—')}<div class="muted">${esc(x.email || '')}</div>`,
                  esc(x.phone || '—')
                ] : [
                  `<strong>${esc(x.name)}</strong>`,
                  `${esc(x.category || '—')}`,
                  esc(x.qty || '0'),
                  statusPill(x.condition || 'Disponível')
                ]).map(v => `<td>${v}</td>`).join('')}
                <td>
                  <div class="actions">
                    <button class="btn small" onclick="editRecord('${type}', '${x.id}')">Editar</button>
                    <button class="btn small danger" onclick="delRecord('${type}', '${x.id}')">Excluir</button>
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="${cfg.cols.length + 1}"><div class="empty"><b>Nenhum registro cadastrado</b>Adicione o primeiro item para organizar o inventário e equipe.</div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openGenericModal(type, rec = {}) {
  editId = rec.id || null;
  formType = type;
  let cfg = genericConfig(type);

  let body = '<div class="form-grid">' + cfg.fields.map(([name, label, t]) => {
    let input = t === 'textarea' ? `<textarea name="${name}">${esc(rec[name] || '')}</textarea>` :
                t === 'event' ? `<select name="${name}"><option value="">Nenhum / Disponível</option>${db.events.map(e => `<option ${rec[name] === e.name ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>` :
                t === 'category' ? `<select name="${name}">${opts(['Som / PA', 'Line Array', 'Microfonia', 'Iluminação / Moving', 'Box Truss / Grid', 'Palco / Praticável', 'Painel de LED', 'Gerador', 'Cabos & AC', 'Outro'], rec[name] || 'Som / PA')}</select>` :
                t === 'condition' ? `<select name="${name}">${opts(['Disponível', 'Reservado', 'Em evento', 'Em manutenção', 'Indisponível'], rec[name] || 'Disponível')}</select>` :
                `<input name="${name}" type="${t}" ${t === 'number' ? 'min="0"' : ''} value="${esc(rec[name] || '')}" ${name === 'name' ? 'required' : ''}>`;
    return `<div class="field ${t === 'textarea' ? 'span2' : ''}"><label>${label}</label>${input}</div>`;
  }).join('') + '</div>';

  showModal(rec.id ? 'Editar Registro' : cfg.title, body, () => {
    let f = formValues();
    if (!f.name) {
      toast('Informe o nome.');
      return;
    }
    if (editId) db[type] = db[type].map(x => x.id === editId ? { ...x, ...f } : x);
    else db[type].push({ id: uid(), ...f });
    saveDB();
    closeModal();
    render();
    toast('Registro salvo!');
  });
}

// --------------------------------------------------
// Cronograma Operacional & Checklist
// --------------------------------------------------
function timelinePage() {
  let rows = [...db.tasks].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  let doneCount = db.tasks.filter(t => t.done).length;
  let pct = db.tasks.length ? Math.round((doneCount / db.tasks.length) * 100) : 0;

  return `
    <div class="section-title">
      <div>
        <h1>Cronograma Operacional & Montagem</h1>
        <p>Acompanhe horários de chegada do caminhão, montagem do grid, passagem de som e show.</p>
      </div>
      <button class="btn primary" onclick="openTaskModal()">＋ Nova Etapa</button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Etapas Operacionais</h3>
          <p>${doneCount} de ${db.tasks.length} concluídas</p>
        </div>
        <span class="pill">${pct}% concluído</span>
      </div>
      <div class="progress"><i style="width: ${pct}%"></i></div>
      <div style="height: 16px"></div>
      ${rows.length ? rows.map(t => `
        <div class="check-item ${t.done ? 'done' : ''}">
          <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask('${t.id}', this.checked)">
          <span>
            <b>${esc(t.title)}</b>
            <small class="muted">${fmtDate(t.date)} · ${esc(t.time || 'Sem horário')} · ${esc(t.event || 'Geral')} · ${esc(t.assignee || 'Sem responsável')}</small>
          </span>
          ${statusPill(t.done ? 'Concluído' : t.date < today() ? 'Atrasado' : 'Pendente')}
          <button class="btn small" onclick="editTask('${t.id}')">Editar</button>
          <button class="btn small danger" onclick="delRecord('tasks', '${t.id}')">×</button>
        </div>
      `).join('') : '<div class="empty"><b>Nenhuma etapa cadastrada</b>Adicione etapas como: descarregamento, montagem de grid Q30, alinhamento de PA e passagem de som.</div>'}
    </div>
  `;
}

function openTaskModal(id) {
  let t = id ? db.tasks.find(x => x.id === id) : {};
  editId = id || null;

  let body = `
    <div class="form-grid">
      <div class="field span2"><label>Etapa / Tarefa *</label><input name="title" required value="${esc(t.title || '')}" placeholder="Ex.: Alinhamento de PA e medição acústica"></div>
      <div class="field"><label>Data</label><input name="date" type="date" value="${esc(t.date || today())}"></div>
      <div class="field"><label>Horário</label><input name="time" type="time" value="${esc(t.time || '')}"></div>
      <div class="field"><label>Evento</label><select name="event"><option value="">Geral</option>${db.events.map(e => `<option ${t.event === e.name ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Técnico Responsável</label><input name="assignee" value="${esc(t.assignee || '')}"></div>
      <div class="field span2"><label>Detalhes</label><textarea name="notes">${esc(t.notes || '')}</textarea></div>
    </div>
  `;

  showModal(id ? 'Editar Etapa' : 'Nova Etapa', body, () => {
    let f = formValues();
    if (!f.title) {
      toast('Informe o título.');
      return;
    }
    if (editId) db.tasks = db.tasks.map(x => x.id === editId ? { ...x, ...f } : x);
    else db.tasks.push({ id: uid(), ...f, done: false });
    saveDB();
    closeModal();
    render();
    toast('Etapa salva!');
  });
}

function editTask(id) {
  openTaskModal(id);
}

function toggleTask(id, v) {
  db.tasks = db.tasks.map(t => t.id === id ? { ...t, done: v } : t);
  saveDB();
  render();
}

function checklistPage() {
  let groups = [...new Set(db.checklist.map(x => x.group || 'Geral'))];
  let doneCount = db.checklist.filter(x => x.done).length;
  let pct = db.checklist.length ? Math.round((doneCount / db.checklist.length) * 100) : 0;

  return `
    <div class="section-title">
      <div>
        <h1>Checklist Técnico de Montagem</h1>
        <p>Conferência detalhada para garantir zero falhas antes do início do evento.</p>
      </div>
      <button class="btn primary" onclick="openChecklistModal()">＋ Novo Item</button>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Checagem de Campo</h3>
          <p>Cabos, frequências de RF, aterramento e contingência de energia.</p>
        </div>
        <span class="pill green">${doneCount}/${db.checklist.length} conferidos</span>
      </div>
      <div class="progress"><i style="width: ${pct}%"></i></div>
      <div style="height: 18px"></div>

      ${db.checklist.length ? groups.map(g => `
        <h4 style="margin: 18px 0 8px; color: var(--accent2); font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">${esc(g)}</h4>
        ${db.checklist.filter(x => (x.group || 'Geral') === g).map(x => `
          <div class="check-item ${x.done ? 'done' : ''}">
            <input type="checkbox" ${x.done ? 'checked' : ''} onchange="toggleCheck('${x.id}', this.checked)">
            <span>${esc(x.title)}<small class="muted">${esc(x.event || 'Todos os eventos')}</small></span>
            <button class="btn small" onclick="editCheck('${x.id}')">Editar</button>
            <button class="btn small danger" onclick="delRecord('checklist', '${x.id}')">×</button>
          </div>
        `).join('')}
      `).join('') : '<div class="empty"><b>Checklist técnico vazio</b>Adicione itens indispensáveis: conferência de tensão elétrica (AC), varredura de frequências sem fio, trava de segurança de moving heads e teste de áudio.</div>'}
    </div>
  `;
}

function openChecklistModal(id) {
  let x = id ? db.checklist.find(y => y.id === id) : {};
  editId = id || null;

  let body = `
    <div class="field"><label>Item de Checagem *</label><input name="title" required value="${esc(x.title || '')}" placeholder="Ex.: Medição de voltagem trifásica e aterramento do palco"></div>
    <div class="form-grid">
      <div class="field"><label>Etapa / Categoria</label><select name="group">${opts(['Pré-Carga & Logística', 'Montagem Estrutural', 'Áudio & RF', 'Iluminação & DMX', 'Show / Operação', 'Desmontagem', 'Geral'], x.group || 'Montagem Estrutural')}</select></div>
      <div class="field"><label>Evento</label><select name="event"><option value="">Todos os eventos</option>${db.events.map(e => `<option ${x.event === e.name ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div>
    </div>
  `;

  showModal(id ? 'Editar Item' : 'Novo Item de Checklist', body, () => {
    let f = formValues();
    if (!f.title) {
      toast('Informe o item.');
      return;
    }
    if (editId) db.checklist = db.checklist.map(y => y.id === editId ? { ...y, ...f } : y);
    else db.checklist.push({ id: uid(), ...f, done: false });
    saveDB();
    closeModal();
    render();
    toast('Checklist atualizado!');
  });
}

function editCheck(id) {
  openChecklistModal(id);
}

function toggleCheck(id, v) {
  db.checklist = db.checklist.map(x => x.id === id ? { ...x, done: v } : x);
  saveDB();
  render();
}

// --------------------------------------------------
// Orçamento e Despesas
// --------------------------------------------------
function budgetPage() {
  let total = db.expenses.reduce((s, x) => s + Number(x.amount || 0), 0);

  return `
    <div class="section-title">
      <div>
        <h1>Orçamento, Locação & Despesas</h1>
        <p>Acompanhe custos de frete, equipe, combustível, locação complementar e alimentação.</p>
      </div>
      <button class="btn primary" onclick="openExpenseModal()">＋ Lançar Despesa</button>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-head">Despesas Lançadas <span class="stat-icon">＄</span></div>
        <strong>${money(total)}</strong>
        <small>Total em custos</small>
      </div>
      <div class="stat">
        <div class="stat-head">Lançamentos <span class="stat-icon">▤</span></div>
        <strong>${db.expenses.length}</strong>
        <small>Registros</small>
      </div>
      <div class="stat">
        <div class="stat-head">Eventos Cadastrados <span class="stat-icon">▣</span></div>
        <strong>${db.events.length}</strong>
        <small>Na agenda</small>
      </div>
      <div class="stat">
        <div class="stat-head">Custo Médio <span class="stat-icon">◷</span></div>
        <strong>${money(db.expenses.length ? total / db.expenses.length : 0)}</strong>
        <small>Por despesa</small>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Lançamentos de Custos</h3>
          <p>Equipe, logística, transporte e equipamentos</p>
        </div>
        <button class="btn" onclick="window.print()">⎙ Imprimir</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Evento</th>
              <th>Categoria</th>
              <th>Data / Vencimento</th>
              <th>Status</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${db.expenses.length ? db.expenses.sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(x => `
              <tr>
                <td><strong>${esc(x.title)}</strong><div class="muted">${esc(x.supplier || '')}</div></td>
                <td>${esc(x.event || '—')}</td>
                <td>${esc(x.category || '—')}</td>
                <td>${fmtDate(x.date)}</td>
                <td>${statusPill(x.status)}</td>
                <td><strong>${money(x.amount)}</strong></td>
                <td>
                  <div class="actions">
                    <button class="btn small" onclick="openExpenseModal('${x.id}')">Editar</button>
                    <button class="btn small danger" onclick="delRecord('expenses', '${x.id}')">Excluir</button>
                  </div>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="7"><div class="empty"><b>Nenhuma despesa lançada</b>Adicione despesas para controlar os custos do evento.</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openExpenseModal(id) {
  let x = id ? db.expenses.find(y => y.id === id) : {};
  editId = id || null;

  let body = `
    <div class="form-grid">
      <div class="field span2"><label>Descrição do Custo *</label><input name="title" required value="${esc(x.title || '')}" placeholder="Ex.: Locação de gerador 100kVA"></div>
      <div class="field"><label>Valor (R$) *</label><input name="amount" type="number" min="0" step="0.01" required value="${esc(x.amount || '')}"></div>
      <div class="field"><label>Data / Vencimento</label><input name="date" type="date" value="${esc(x.date || today())}"></div>
      <div class="field"><label>Categoria</label><select name="category">${opts(['Cachê da Equipe', 'Locação Complementar', 'Combustível / Frete', 'Alimentação', 'Gerador de Energia', 'Manutenção', 'Outros'], x.category || 'Locação Complementar')}</select></div>
      <div class="field"><label>Status</label><select name="status">${opts(['Pendente', 'Pago', 'Atrasado'], x.status || 'Pendente')}</select></div>
      <div class="field"><label>Evento Relacionado</label><select name="event"><option value="">Geral</option>${db.events.map(e => `<option ${x.event === e.name ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Fornecedor</label><select name="supplier"><option value="">Não informado</option>${db.suppliers.map(s => `<option ${x.supplier === s.name ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      <div class="field span2"><label>Observações</label><textarea name="notes">${esc(x.notes || '')}</textarea></div>
    </div>
  `;

  showModal(id ? 'Editar Despesa' : 'Nova Despesa', body, () => {
    let f = formValues();
    if (!f.title || f.amount === '') {
      toast('Preencha a descrição e o valor.');
      return;
    }
    f.amount = Number(f.amount);
    if (editId) db.expenses = db.expenses.map(y => y.id === editId ? { ...y, ...f } : y);
    else db.expenses.push({ id: uid(), ...f });
    saveDB();
    closeModal();
    render();
    toast('Despesa salva!');
  });
}

// --------------------------------------------------
// Mapa de Palco (Stage Plot Interativo)
// --------------------------------------------------
function stagePage() {
  return `
    <div class="section-title">
      <div>
        <h1>Mapa de Palco (Stage Plot Interativo)</h1>
        <p>Defina o layout do palco, backline, microfones, monitores e iluminação.</p>
      </div>
      <div class="toolbar no-print" style="margin: 0">
        <button class="btn" onclick="resetStage()">Limpar Mapa</button>
        <button class="btn primary" onclick="addStageItem()">＋ Adicionar Elemento</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Stage Plot Visual SONOVOLT</h3>
          <p>Arraste os elementos no mapa para posicionar. Selecione para renomear ou remover.</p>
        </div>
        <span class="pill green">Visual</span>
      </div>

      <div class="stage-layout">
        <div class="stage" id="stageCanvas">
          <div class="stage-label">FUNDO DO PALCO / BACKLINE</div>
          ${db.stage.map(s => `
            <div class="stage-item ${stageSelected === s.id ? 'selected' : ''}" data-id="${s.id}" style="left:${s.x}%;top:${s.y}%">
              <span>${esc(s.icon || '▣')}</span>
              ${esc(s.name)}
            </div>
          `).join('')}
        </div>

        <div class="stage-tools">
          <div class="field">
            <label>Nome do Elemento</label>
            <input id="stageName" placeholder="Ex.: Vocal Principal / Microfone">
          </div>
          <div class="field">
            <label>Tipo / Ícone</label>
            <select id="stageIcon">
              <option value="🎤">Microfone (🎤)</option>
              <option value="🔊">Monitor de Chão / In-Ear (🔊)</option>
              <option value="🎸">Guitarra / Baixo (🎸)</option>
              <option value="🥁">Bateria (🥁)</option>
              <option value="🎹">Teclado / Synth (🎹)</option>
              <option value="🎛️">Mesa de Som / PA / FOH (🎛️)</option>
              <option value="💡">Refletor / Moving Head (💡)</option>
              <option value="⚡">Ponto de Energia / AC (⚡)</option>
              <option value="▣">Outro (▣)</option>
            </select>
          </div>
          <button class="btn primary" onclick="addStageItem()">Adicionar ao Palco</button>
          <button class="btn" onclick="editSelectedStage()">Renomear Selecionado</button>
          <button class="btn danger" onclick="removeSelectedStage()">Remover Selecionado</button>
          <p class="muted" style="font-size: 11px; line-height: 1.5; margin-top: 8px;">
            Dica: arraste os elementos para montar a disposição. Imprima esta página para entregar aos roadies e artistas.
          </p>
        </div>
      </div>
    </div>
  `;
}

function addStageItem() {
  let nameEl = document.getElementById('stageName');
  let name = nameEl ? nameEl.value.trim() : '';
  let icon = document.getElementById('stageIcon')?.value || '▣';

  if (!name) {
    toast('Digite o nome do elemento de palco.');
    nameEl?.focus();
    return;
  }

  let s = {
    id: uid(),
    name,
    icon,
    x: 10 + (db.stage.length % 5) * 16,
    y: 24 + Math.floor(db.stage.length / 5) * 20
  };

  db.stage.push(s);
  stageSelected = s.id;
  saveDB();
  render();
  toast('Elemento adicionado ao palco.');
}

function editSelectedStage() {
  let s = db.stage.find(x => x.id === stageSelected);
  if (!s) {
    toast('Selecione um elemento no palco.');
    return;
  }
  let name = prompt('Novo nome do elemento:', s.name);
  if (name === null) return;
  if (!name.trim()) {
    toast('O nome não pode ficar vazio.');
    return;
  }
  s.name = name.trim();
  saveDB();
  render();
}

function removeSelectedStage() {
  if (!stageSelected) {
    toast('Selecione um elemento no palco.');
    return;
  }
  db.stage = db.stage.filter(x => x.id !== stageSelected);
  stageSelected = null;
  saveDB();
  render();
  toast('Elemento removido.');
}

function resetStage() {
  if (!confirm('Deseja limpar todos os elementos do mapa de palco?')) return;
  db.stage = [];
  stageSelected = null;
  saveDB();
  render();
}

function bindStageDrag() {
  let canvas = document.getElementById('stageCanvas');
  if (!canvas) return;

  canvas.querySelectorAll('.stage-item').forEach(el => {
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      stageSelected = el.dataset.id;
      let s = db.stage.find(x => x.id === stageSelected);
      if (!s) return;

      el.classList.add('selected');
      el.setPointerCapture(e.pointerId);
      let rect = canvas.getBoundingClientRect();

      const move = ev => {
        let x = Math.max(0, Math.min(90, ((ev.clientX - rect.left) / rect.width) * 100 - 5));
        let y = Math.max(6, Math.min(84, ((ev.clientY - rect.top) / rect.height) * 100 - 4));
        s.x = x;
        s.y = y;
        el.style.left = x + '%';
        el.style.top = y + '%';
      };

      const up = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        saveDB();
      };

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
    });

    el.addEventListener('click', () => {
      stageSelected = el.dataset.id;
      canvas.querySelectorAll('.stage-item').forEach(a => a.classList.toggle('selected', a === el));
    });
  });
}

// --------------------------------------------------
// Relatórios & Backup (JSON / PDF)
// --------------------------------------------------
function reportsPage() {
  let total = db.expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
  let byStatus = {};
  db.events.forEach(e => byStatus[e.status] = (byStatus[e.status] || 0) + 1);

  return `
    <div class="section-title">
      <div>
        <h1>Relatórios Operacionais SONOVOLT</h1>
        <p>Resumo geral e exportação de backups da base de Guaratinguetá-SP.</p>
      </div>
      <button class="btn primary" onclick="window.print()">⎙ Imprimir / Salvar em PDF</button>
    </div>

    <div class="report-cards">
      <div class="stat">
        <div class="stat-head">Total de Eventos</div>
        <strong>${db.events.length}</strong>
        <small>Na agenda</small>
      </div>
      <div class="stat">
        <div class="stat-head">Etapas Concluídas</div>
        <strong>${db.tasks.filter(x => x.done).length}/${db.tasks.length}</strong>
        <small>Do cronograma</small>
      </div>
      <div class="stat">
        <div class="stat-head">Despesas Totais</div>
        <strong>${money(total)}</strong>
        <small>Lançadas</small>
      </div>
    </div>

    <div class="dashboard-grid" style="margin-top: 18px">
      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Status dos Eventos</h3>
            <p>Distribuição atual da agenda</p>
          </div>
        </div>
        ${Object.keys(byStatus).length ? Object.entries(byStatus).map(([s, n]) => `
          <div style="margin: 15px 0">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span>${statusPill(s)}</span>
              <b>${n}</b>
            </div>
            <div class="progress"><i style="width: ${(n / db.events.length) * 100}%"></i></div>
          </div>
        `).join('') : '<div class="empty">Cadastre eventos para visualizar gráficos.</div>'}
      </section>

      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>Inventário & Recursos</h3>
            <p>Resumo dos itens cadastrados</p>
          </div>
        </div>
        ${[
          ['Técnicos & Equipe', db.team.length],
          ['Fornecedores & Parceiros', db.suppliers.length],
          ['Equipamentos & Riders', db.equipment.length],
          ['Itens de Checklist Técnico', db.checklist.length],
          ['Lançamentos Financeiros', db.expenses.length]
        ].map(([n, v]) => `
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line)">
            <span>${n}</span>
            <b>${v}</b>
          </div>
        `).join('')}
      </section>
    </div>

    <div class="panel" style="margin-top: 18px">
      <div class="panel-head">
        <div>
          <h3>Exportação e Importação de Segurança</h3>
          <p>Mantenha uma cópia de segurança de todos os eventos e riders da SONOVOLT.</p>
        </div>
      </div>
      <div class="toolbar">
        <button class="btn primary" onclick="exportBackup()">⇩ Exportar Backup (.JSON)</button>
        <label class="btn" for="importFile" style="cursor:pointer">⇧ Importar Backup (.JSON)</label>
        <input id="importFile" type="file" accept=".json,application/json" style="display:none" onchange="importBackup(event)">
      </div>
      <p class="muted" style="font-size: 12px; margin-top: 10px;">
        Os dados ficam guardados no navegador do seu dispositivo. Faça exportações regulares para garantir a segurança dos seus projetos.
      </p>
    </div>
  `;
}

function exportBackup() {
  let blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sonovolt-backup-' + today() + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup exportado com sucesso.');
}

function importBackup(ev) {
  let file = ev.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = () => {
    try {
      let parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.events)) throw Error('invalid');
      if (!confirm('Importar este arquivo substituirá os dados atuais do navegador. Deseja continuar?')) return;
      db = { ...structuredClone(initialDB), ...parsed };
      saveDB();
      render();
      toast('Backup importado com sucesso!');
    } catch (e) {
      alert('Arquivo inválido. Selecione um arquivo .json exportado pelo sistema SONOVOLT.');
    }
    ev.target.value = '';
  };
  reader.readAsText(file);
}

// Inicialização com Verificação de Senha
document.addEventListener('DOMContentLoaded', () => {
  if (checkAuth()) {
    render();
  }
});
