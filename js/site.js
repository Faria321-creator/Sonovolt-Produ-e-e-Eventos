/**
 * ==========================================================================
 * SONOVOLT Produções e Eventos - Lógica do Site & Live Editor (site.js)
 * ==========================================================================
 * Suporta navegação normal E Modo de Edição Ao Vivo (Live WYSIWYG)
 * onde você clica em qualquer texto para editar, troca fotos na hora e
 * clica em "PUBLICAR SITE ATUALIZADO"!
 */

let activeConfig = null;
let isEditMode = false;

document.addEventListener("DOMContentLoaded", () => {
  activeConfig = getActiveConfig();
  checkEditMode();
  
  applySiteConfig(activeConfig);
  renderAboutGallery(activeConfig);
  renderServices(activeConfig);
  renderPortfolio(activeConfig, "all");
  initFilters(activeConfig);
  initForm(activeConfig);
  initMenu();
  initAuthModal();
  initVideoModal();

  if (isEditMode) {
    enableLiveEditor();
  }
});

// Verifica se está no modo de edição (URL ?edit=true ou sessão de produtor)
function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  const auth = sessionStorage.getItem("sonovolt_authenticated") === "true";
  if (params.get("edit") === "true" || (auth && params.get("mode") === "edit")) {
    isEditMode = true;
  }
}

// Obtém as configurações publicadas ou do data.js
function getActiveConfig() {
  try {
    const published = localStorage.getItem("sonovolt_published_site");
    if (published) {
      const parsed = JSON.parse(published);
      if (parsed && parsed.company) {
        // Assegura retrocompatibilidade com a galeria de até 4 fotos do Quem Somos
        if (!parsed.about || !Array.isArray(parsed.about.photos) || parsed.about.photos.length === 0) {
          parsed.about = typeof SONOVOLT_CONFIG !== "undefined" && SONOVOLT_CONFIG.about
            ? structuredClone(SONOVOLT_CONFIG.about)
            : {
                fitMode: "cover",
                photos: [
                  { id: 1, url: "assets/logo-sonovolt.jpg", title: "Logo Oficial SONOVOLT" },
                  { id: 2, url: "assets/hero-banner.jfif", title: "Palco & Iluminação de Festival" },
                  { id: 3, url: "assets/logo-sonovolt.jpg", title: "Estruturas Box Truss & Áudio" },
                  { id: 4, url: "assets/hero-banner.jfif", title: "Montagem Técnica & Operação" }
                ]
              };
        }
        return parsed;
      }
    }
  } catch (e) {}

  return typeof SONOVOLT_CONFIG !== "undefined" ? structuredClone(SONOVOLT_CONFIG) : {
    company: {
      name: "SONOVOLT",
      tagline: "PRODUÇÕES & EVENTOS",
      email: "sonovolt@gmail.com",
      phone: "(12) 98183-0623",
      whatsappLink: "https://wa.me/5512981830623",
      location: "Guaratinguetá-SP • Vale do Paraíba",
      social: {}
    },
    hero: {
      eyebrow: "Guaratinguetá-SP • Vale do Paraíba",
      title: "Seu evento com a máxima<br><span class=\"gradient\">potência & estrutura.</span>",
      desc: "Somos agentes de eventos especialistas em infraestrutura completa: montagem, desmontagem técnica, locação de som profissional, iluminação cênica, palcos, painéis de LED e estruturas para festivais, eventos corporativos, públicos, fechados, casamentos e formaturas."
    },
    about: {
      fitMode: "cover",
      photos: [
        { id: 1, url: "assets/logo-sonovolt.jpg", title: "Logo Oficial SONOVOLT" },
        { id: 2, url: "assets/hero-banner.jfif", title: "Palco & Iluminação de Festival" },
        { id: 3, url: "assets/logo-sonovolt.jpg", title: "Estruturas Box Truss & Áudio" },
        { id: 4, url: "assets/hero-banner.jfif", title: "Montagem Técnica & Operação" }
      ]
    },
    services: [],
    portfolio: []
  };
}

// Aplica as informações no site
function applySiteConfig(conf) {
  const comp = conf.company || {};
  const hero = conf.hero || {};

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hero
  const heroTagEl = document.getElementById("heroEyebrowText");
  if (heroTagEl && hero.eyebrow) heroTagEl.textContent = hero.eyebrow;

  const heroTitleEl = document.getElementById("heroMainTitle");
  if (heroTitleEl && hero.title) heroTitleEl.innerHTML = hero.title;

  const heroDescEl = document.getElementById("heroDescription");
  if (heroDescEl && hero.desc) heroDescEl.textContent = hero.desc;

  // Contatos
  const emailEl = document.getElementById("displayEmail");
  if (emailEl) emailEl.textContent = comp.email || "sonovolt@gmail.com";

  const phoneEl = document.getElementById("displayPhone");
  if (phoneEl) phoneEl.textContent = comp.phone || "(12) 98183-0623";

  const locationEl = document.getElementById("displayLocation");
  if (locationEl) locationEl.textContent = comp.location || "Guaratinguetá-SP • Vale do Paraíba";

  // Redes Sociais
  if (comp.social) {
    document.querySelectorAll(".insta-link").forEach(a => a.href = comp.social.instagram || "https://instagram.com/sonovolteventos");
    document.querySelectorAll(".face-link").forEach(a => a.href = comp.social.facebook || "https://facebook.com/sonovolteventos");
    document.querySelectorAll(".zap-link").forEach(a => a.href = comp.whatsappLink || "https://wa.me/5512981830623");
  }

  // Logo
  if (comp.logo) {
    document.querySelectorAll(".brand-logo-img").forEach(img => img.src = comp.logo);
  }

  // Título e Textos do Sobre
  if (conf.about && conf.about.title) {
    const aboutTitleEl = document.querySelector("#sobre .about-copy h2");
    if (aboutTitleEl) aboutTitleEl.innerHTML = conf.about.title;
  }
}

// ==========================================================================
// 📸 GALERIA DE FOTOS "QUEM SOMOS" (Até 4 fotos, ajuste no retângulo, rotação)
// ==========================================================================
let currentAboutIndex = 0;
let aboutAutoPlayTimer = null;

function renderAboutGallery(conf) {
  const container = document.getElementById("aboutSlidesContainer");
  const dotsContainer = document.getElementById("aboutDotsContainer");
  const box = document.getElementById("aboutVisualBox");
  const badge = document.getElementById("aboutBadgeText");
  const fitLabel = document.getElementById("lblFitMode");

  if (!container || !box) return;

  const about = conf.about || { fitMode: "cover", photos: [] };
  const photos = about.photos || [];

  if (photos.length === 0) {
    photos.push({ id: 1, url: "assets/logo-sonovolt.jpg", title: "SONOVOLT" });
  }

  // Define modo de ajuste: "cover" (preenche perfeitamente as bordas arredondadas) ou "contain"
  const isCover = about.fitMode !== "contain";
  box.classList.remove("fit-cover", "fit-contain");
  box.classList.add(isCover ? "fit-cover" : "fit-contain");
  if (fitLabel) {
    fitLabel.textContent = isCover ? "Preencher Retângulo" : "Foto Inteira";
  }

  if (currentAboutIndex >= photos.length) {
    currentAboutIndex = 0;
  }

  // Renderiza slides de foto
  container.innerHTML = photos.map((p, idx) => `
    <div class="about-slide ${idx === currentAboutIndex ? "active" : ""}" data-idx="${idx}">
      <img src="${p.url}" alt="${esc(p.title || "SONOVOLT Eventos")}">
    </div>
  `).join("");

  // Renderiza bolinhas indicadoras
  if (dotsContainer) {
    dotsContainer.innerHTML = photos.map((_, idx) => `
      <button type="button" class="about-dot ${idx === currentAboutIndex ? "active" : ""}" 
        onclick="goToAboutPhoto(${idx})" 
        aria-label="Foto ${idx + 1}" title="Foto ${idx + 1}"></button>
    `).join("");
  }

  // Atualiza contador badge
  if (badge) {
    badge.textContent = `${currentAboutIndex + 1} / ${photos.length}`;
  }

  // Mostra ou esconde setas se houver apenas 1 foto
  const prevBtn = document.getElementById("aboutPrevBtn");
  const nextBtn = document.getElementById("aboutNextBtn");
  if (prevBtn && nextBtn) {
    const showNav = photos.length > 1;
    prevBtn.style.display = showNav ? "flex" : "none";
    nextBtn.style.display = showNav ? "flex" : "none";
  }

  // Renderiza o gerenciador de fotos no painel de edição
  renderAboutEditorThumbs(conf);

  // Inicia rotação suave se tiver mais de uma foto
  startAboutAutoPlay(photos.length);
}

function showAboutSlide(index) {
  const photos = activeConfig?.about?.photos || [];
  if (photos.length === 0) return;

  currentAboutIndex = (index + photos.length) % photos.length;

  const slides = document.querySelectorAll("#aboutSlidesContainer .about-slide");
  slides.forEach((sl, idx) => {
    sl.classList.toggle("active", idx === currentAboutIndex);
  });

  const dots = document.querySelectorAll("#aboutDotsContainer .about-dot");
  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentAboutIndex);
  });

  const badge = document.getElementById("aboutBadgeText");
  if (badge) {
    badge.textContent = `${currentAboutIndex + 1} / ${photos.length}`;
  }

  document.querySelectorAll(".about-thumb-slot").forEach((slot, idx) => {
    slot.classList.toggle("active-slot", idx === currentAboutIndex);
  });
}

function nextAboutPhoto() {
  const photos = activeConfig?.about?.photos || [];
  if (photos.length > 1) {
    showAboutSlide(currentAboutIndex + 1);
  }
}

function prevAboutPhoto() {
  const photos = activeConfig?.about?.photos || [];
  if (photos.length > 1) {
    showAboutSlide(currentAboutIndex - 1);
  }
}

function goToAboutPhoto(index) {
  showAboutSlide(index);
}

function startAboutAutoPlay(numPhotos) {
  clearInterval(aboutAutoPlayTimer);
  if (numPhotos <= 1 || isEditMode) return;

  aboutAutoPlayTimer = setInterval(() => {
    nextAboutPhoto();
  }, 4800);
}

// Alternar entre preencher o retângulo arredondado ou conter a foto inteira
function toggleAboutFitMode() {
  if (!activeConfig.about) activeConfig.about = { fitMode: "cover", photos: [] };
  activeConfig.about.fitMode = activeConfig.about.fitMode === "cover" ? "contain" : "cover";
  renderAboutGallery(activeConfig);
  showToast(`Enquadramento alterado para: ${activeConfig.about.fitMode === "cover" ? "Preencher Todo Retângulo" : "Mostrar Foto Inteira"}.`);
}

// Renderiza miniaturas e controles de edição da galeria Quem Somos
function renderAboutEditorThumbs(conf) {
  const mgr = document.getElementById("aboutThumbsManager");
  if (!mgr) return;

  const about = conf.about || { photos: [] };
  const photos = about.photos || [];

  let html = photos.map((p, idx) => `
    <div class="about-thumb-slot ${idx === currentAboutIndex ? "active-slot" : ""}" data-idx="${idx}">
      ${photos.length > 1 ? `<button type="button" class="btn-thumb-delete" onclick="removeAboutPhoto(${idx})" title="Remover esta foto">×</button>` : ""}
      <span class="thumb-num">Foto ${idx + 1}</span>
      <img src="${p.url}" alt="Foto ${idx + 1}" onclick="goToAboutPhoto(${idx})" title="Clique para visualizar esta foto">
      <label class="btn-thumb-change">
        📷 Trocar
        <input type="file" accept="image/*" style="display:none;" onchange="changeAboutPhoto(event, ${idx})">
      </label>
    </div>
  `).join("");

  if (photos.length < 4) {
    html += `
      <label class="about-thumb-slot add-slot" title="Adicionar mais uma foto (máximo 4)">
        <span>＋</span>
        <small>Adicionar Foto</small>
        <input type="file" accept="image/*" style="display:none;" onchange="addAboutPhoto(event)">
      </label>
    `;
  }

  mgr.innerHTML = html;
}

// Troca foto específica dentre as 4
function changeAboutPhoto(ev, photoIndex) {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (!activeConfig.about) activeConfig.about = { fitMode: "cover", photos: [] };
    if (!activeConfig.about.photos[photoIndex]) return;

    activeConfig.about.photos[photoIndex].url = reader.result;
    currentAboutIndex = photoIndex;
    renderAboutGallery(activeConfig);
    showToast(`Foto ${photoIndex + 1} alterada com sucesso! Lembre-se de clicar em "PUBLICAR SITE ATUALIZADO".`);
  };
  reader.readAsDataURL(file);
}

// Adiciona uma nova foto à galeria (até 4)
function addAboutPhoto(ev) {
  const file = ev.target.files[0];
  if (!file) return;

  if (!activeConfig.about) activeConfig.about = { fitMode: "cover", photos: [] };
  if (activeConfig.about.photos.length >= 4) {
    alert("Limite máximo de 4 fotos atingido nesta seção!");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    activeConfig.about.photos.push({
      id: Date.now(),
      url: reader.result,
      title: "Foto " + (activeConfig.about.photos.length + 1)
    });
    currentAboutIndex = activeConfig.about.photos.length - 1;
    renderAboutGallery(activeConfig);
    showToast(`Foto ${activeConfig.about.photos.length} adicionada! Lembre-se de clicar em "PUBLICAR SITE ATUALIZADO".`);
  };
  reader.readAsDataURL(file);
}

// Remove uma foto da galeria
function removeAboutPhoto(photoIndex) {
  if (!activeConfig.about || activeConfig.about.photos.length <= 1) {
    alert("Mantenha ao menos 1 foto na galeria.");
    return;
  }
  if (!confirm(`Deseja remover a Foto ${photoIndex + 1}?`)) return;

  activeConfig.about.photos.splice(photoIndex, 1);
  if (currentAboutIndex >= activeConfig.about.photos.length) {
    currentAboutIndex = activeConfig.about.photos.length - 1;
  }
  renderAboutGallery(activeConfig);
  showToast("Foto removida. Lembre-se de clicar em Publicar para salvar.");
}

// Renderiza a lista de serviços
function renderServices(conf) {
  const container = document.getElementById("servicesContainer");
  if (!container) return;

  const services = conf.services || [];
  container.innerHTML = services.map((s, idx) => `
    <article class="service-card" data-service-idx="${idx}">
      <div class="service-icon" ${isEditMode ? 'contenteditable="true"' : ''} data-field="icon">${s.icon || '⚡'}</div>
      <h3 ${isEditMode ? 'contenteditable="true"' : ''} data-field="title">${esc(s.title)}</h3>
      <p ${isEditMode ? 'contenteditable="true"' : ''} data-field="desc">${esc(s.desc)}</p>
      ${s.items && s.items.length ? `
        <ul>
          ${s.items.map((item, iIdx) => `<li ${isEditMode ? 'contenteditable="true"' : ''} data-field="item" data-item-idx="${iIdx}">${esc(item)}</li>`).join('')}
        </ul>
      ` : ''}
    </article>
  `).join('');
}

// Renderiza fotos e vídeos do portfólio
function renderPortfolio(conf, filterCategory = "all") {
  const container = document.getElementById("portfolioContainer");
  if (!container) return;

  const allProjects = conf.portfolio || [];
  const projects = allProjects.filter(p => {
    return filterCategory === "all" || p.category === filterCategory;
  });

  let editActionsHeader = '';
  if (isEditMode) {
    editActionsHeader = `
      <div style="grid-column: 1 / -1; margin-bottom: 12px; display: flex; gap: 10px; align-items: center; justify-content: space-between; background: #0c1421; padding: 14px 20px; border-radius: 12px; border: 1px dashed var(--line-glow);">
        <div>
          <b style="color:var(--accent2)">Galeria com ${allProjects.length} itens</b>
          <span style="color:var(--muted); font-size:12px; display:block">Você pode adicionar mais de 10 fotos ou vídeos do seu evento!</span>
        </div>
        <button class="btn primary small" onclick="openAddMediaModal()">＋ Adicionar Foto ou Vídeo</button>
      </div>
    `;
  }

  if (projects.length === 0) {
    container.innerHTML = editActionsHeader + `<div style="grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 40px;">Nenhum item nesta categoria. Clique em "Adicionar Foto ou Vídeo" para incluir.</div>`;
    return;
  }

  container.innerHTML = editActionsHeader + projects.map(p => {
    const isVideo = p.type === "video" || !!p.videoUrl;
    const media = p.mediaUrl || p.image || "assets/logo-sonovolt.jpg";
    const badge = p.badge ? `<span class="project-badge">${esc(p.badge)}</span>` : (isVideo ? `<span class="project-badge">VÍDEO 🎬</span>` : "");

    let editControls = '';
    if (isEditMode) {
      editControls = `
        <div class="card-edit-bar">
          <label class="card-edit-btn" title="Trocar foto desta publicação">
            📷 Trocar Foto
            <input type="file" accept="image/*" style="display:none" onchange="changeCardPhoto(event, ${p.id})">
          </label>
          <button class="card-edit-btn danger" onclick="removePortfolioItem(${p.id})">🗑️ Excluir</button>
        </div>
      `;
    }

    return `
      <article class="project-card" data-id="${p.id}">
        <div class="project-art ${isVideo ? 'has-video' : ''}">
          <span class="project-tag" ${isEditMode ? 'contenteditable="true"' : ''} data-field="tag">${esc(p.tag || 'PRODUÇÃO')}</span>
          ${badge}
          
          ${media ? `<img src="${media}" alt="${esc(p.title)}" loading="lazy" id="cardImg_${p.id}">` : `<div style="font-size: 50px; color: var(--electric-cyan);">⚡</div>`}
          
          ${isVideo ? `<button class="video-play-btn" onclick="openVideoModal('${esc(p.videoUrl)}', '${esc(p.title)}')" aria-label="Assistir Vídeo">▶</button>` : ''}
          ${editControls}
        </div>
        <div class="project-body">
          <h3 ${isEditMode ? 'contenteditable="true"' : ''} data-field="title">${esc(p.title)}</h3>
          <p ${isEditMode ? 'contenteditable="true"' : ''} data-field="desc">${esc(p.desc)}</p>
          <div class="project-meta">
            <span ${isEditMode ? 'contenteditable="true"' : ''} data-field="location">📍 ${esc(p.location || 'Guaratinguetá - SP')}</span>
            <span ${isEditMode ? 'contenteditable="true"' : ''} data-field="date">📅 ${esc(p.date || 'Recente')}</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// --------------------------------------------------
// 🎨 MODO DE EDIÇÃO AO VIVO (WYSIWYG IN-PAGE)
// --------------------------------------------------
function enableLiveEditor() {
  document.body.classList.add("editing-active");
  clearInterval(aboutAutoPlayTimer);

  // Barra de ferramentas flutuante no topo
  const editorBar = document.createElement("div");
  editorBar.className = "live-editor-bar";
  editorBar.id = "liveEditorBar";
  editorBar.innerHTML = `
    <div class="live-editor-info">
      <span class="live-editor-status">● MODO EDIÇÃO ATIVADO</span>
      <span style="color:#fff; font-weight:600;">Clique em qualquer texto para escrever diretamente!</span>
    </div>

    <div class="live-editor-actions">
      <button class="btn small" onclick="openAddMediaModal()">＋ Adicionar Foto/Vídeo</button>
      <label class="btn small" style="cursor:pointer;" title="Trocar logotipo da empresa">
        📷 Trocar Logo
        <input type="file" accept="image/*" style="display:none" onchange="changeCompanyLogo(event)">
      </label>
      <a class="btn small" href="painel.html" target="_blank">⚙️ Painel Operacional</a>
      <button class="btn small" onclick="exitEditMode()">👁️ Sair da Edição</button>
      <button class="btn btn-publish-live" onclick="publishLiveChanges()">🚀 PUBLICAR SITE ATUALIZADO</button>
    </div>
  `;
  document.body.prepend(editorBar);

  // Torna textos editáveis com contenteditable
  makeElementsEditable();
  renderAboutGallery(activeConfig);
}

function makeElementsEditable() {
  const editableSelectors = [
    "#heroEyebrowText",
    "#heroMainTitle",
    "#heroDescription",
    ".section h2",
    ".section-head p",
    ".about-copy p",
    ".pillar b",
    ".pillar small",
    ".area-card h3",
    ".area-card p",
    ".process-step h3",
    ".process-step p",
    ".cta-banner h2",
    ".cta-banner p"
  ];

  editableSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.setAttribute("contenteditable", "true");
    });
  });
}

function exitEditMode() {
  isEditMode = false;
  document.body.classList.remove("editing-active");
  document.getElementById("liveEditorBar")?.remove();
  document.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));
  renderAboutGallery(activeConfig);
  renderServices(activeConfig);
  renderPortfolio(activeConfig, "all");
  showToast("Visualizando site no modo visitante.");
}

// Troca logo da empresa por arquivo local do computador
function changeCompanyLogo(ev) {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    activeConfig.company.logo = reader.result;
    document.querySelectorAll(".brand-logo-img").forEach(img => img.src = reader.result);
    showToast("Logo alterado! Clique em 'PUBLICAR SITE ATUALIZADO' para salvar.");
  };
  reader.readAsDataURL(file);
}

// Troca foto do card do portfólio
function changeCardPhoto(ev, id) {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const item = activeConfig.portfolio.find(p => p.id === id);
    if (item) {
      item.mediaUrl = reader.result;
      item.image = reader.result;
      const imgEl = document.getElementById("cardImg_" + id);
      if (imgEl) imgEl.src = reader.result;
      showToast("Foto atualizada! Lembre-se de clicar em Publicar.");
    }
  };
  reader.readAsDataURL(file);
}

function removePortfolioItem(id) {
  if (!confirm("Deseja excluir este item do portfólio?")) return;
  activeConfig.portfolio = activeConfig.portfolio.filter(p => p.id !== id);
  renderPortfolio(activeConfig, "all");
  showToast("Item excluído! Clique em Publicar para confirmar.");
}

// Adicionar nova foto ou vídeo
function openAddMediaModal() {
  const title = prompt("Digite o título do novo evento / trabalho:");
  if (!title) return;

  const isVid = confirm("Este item é um VÍDEO do YouTube? (Clique OK para Vídeo ou Cancelar para FOTO)");
  let videoUrl = "";
  if (isVid) {
    videoUrl = prompt("Cole o link do vídeo do YouTube:");
  }

  const category = prompt("Qual a categoria? (festival, corporativo, formatura, casamento, publico, fechado)", "festival") || "festival";
  const desc = prompt("Breve descrição dos serviços (som, luz, palco):") || "Infraestrutura completa de sonorização e iluminação.";
  const location = prompt("Local / Cidade:", "Guaratinguetá - SP") || "Guaratinguetá - SP";

  const newItem = {
    id: Date.now(),
    type: isVid ? "video" : "image",
    title,
    category,
    tag: category.toUpperCase(),
    badge: "NOVO",
    desc,
    date: "Recente",
    location,
    mediaUrl: "assets/logo-sonovolt.jpg",
    videoUrl: videoUrl || ""
  };

  activeConfig.portfolio.unshift(newItem);
  renderPortfolio(activeConfig, "all");
  showToast("Novo item adicionado à galeria! Clique em 'PUBLICAR SITE ATUALIZADO'.");
}

// 🚀 PUBLICAR TODAS AS ALTERAÇÕES FEITAS DIRETO NO SITE
function publishLiveChanges() {
  // Coleta os textos do Hero
  const eyebrowEl = document.getElementById("heroEyebrowText");
  if (eyebrowEl) activeConfig.hero.eyebrow = eyebrowEl.textContent.trim();

  const titleEl = document.getElementById("heroMainTitle");
  if (titleEl) activeConfig.hero.title = titleEl.innerHTML;

  const descEl = document.getElementById("heroDescription");
  if (descEl) activeConfig.hero.desc = descEl.textContent.trim();

  // Coleta alterações de textos do Quem Somos
  const aboutTitleEl = document.querySelector("#sobre .about-copy h2");
  if (aboutTitleEl) {
    if (!activeConfig.about) activeConfig.about = { fitMode: "cover", photos: [] };
    activeConfig.about.title = aboutTitleEl.innerHTML;
  }

  // Coleta alterações nos cards do portfólio
  document.querySelectorAll(".project-card").forEach(card => {
    const id = Number(card.dataset.id);
    const item = activeConfig.portfolio.find(p => p.id === id);
    if (item) {
      const titleEl = card.querySelector("[data-field='title']");
      if (titleEl) item.title = titleEl.textContent.trim();

      const descEl = card.querySelector("[data-field='desc']");
      if (descEl) item.desc = descEl.textContent.trim();

      const tagEl = card.querySelector("[data-field='tag']");
      if (tagEl) item.tag = tagEl.textContent.trim();
    }
  });

  // Salva no LocalStorage permanente do navegador
  localStorage.setItem("sonovolt_published_site", JSON.stringify(activeConfig));

  showToast("🚀 SITE PUBLICADO COM SUCESSO! Todas as alterações estão salvas e ativas.");
}

// --------------------------------------------------
// Modais, Filtros e Ações
// --------------------------------------------------
function initFilters(conf) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");
      renderPortfolio(activeConfig, category);
    });
  });
}

function initVideoModal() {
  const backdrop = document.getElementById("videoModalBackdrop");
  const closeBtn = document.getElementById("videoModalClose");
  if (!backdrop) return;

  if (closeBtn) closeBtn.addEventListener("click", closeVideoModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeVideoModal();
  });
}

function openVideoModal(url, title) {
  if (!url) {
    showToast("Vídeo em preparação. Em breve disponível!");
    return;
  }

  const backdrop = document.getElementById("videoModalBackdrop");
  const titleEl = document.getElementById("videoModalTitle");
  const bodyEl = document.getElementById("videoModalBody");
  if (!backdrop || !bodyEl) return;

  if (titleEl) titleEl.textContent = title || "Vídeo da Produção SONOVOLT";

  let embedUrl = url;
  if (url.includes("youtube.com/watch?v=")) {
    embedUrl = url.replace("watch?v=", "embed/");
  } else if (url.includes("youtu.be/")) {
    embedUrl = url.replace("youtu.be/", "www.youtube.com/embed/");
  }

  if (embedUrl.includes("youtube.com") || embedUrl.includes("vimeo.com")) {
    bodyEl.innerHTML = `<iframe src="${embedUrl}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    bodyEl.innerHTML = `<video src="${embedUrl}" controls autoplay style="width:100%;height:100%;object-fit:contain;"></video>`;
  }

  backdrop.classList.add("open");
}

function closeVideoModal() {
  const backdrop = document.getElementById("videoModalBackdrop");
  const bodyEl = document.getElementById("videoModalBody");
  if (bodyEl) bodyEl.innerHTML = "";
  if (backdrop) backdrop.classList.remove("open");
}

function initMenu() {
  const toggleBtn = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("open");
  });

  document.querySelectorAll("#navLinks a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  document.addEventListener("click", (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
      navLinks.classList.remove("open");
    }
  });
}

function initForm(conf) {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const company = document.getElementById("company").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const kind = document.getElementById("kind").value;
    const date = document.getElementById("date").value;
    const details = document.getElementById("details").value.trim();

    const comp = conf.company || { email: "sonovolt@gmail.com" };

    const subject = encodeURIComponent(`Pedido de Orçamento SONOVOLT — ${kind}`);
    const message = `Olá, SONOVOLT Produções e Eventos!
Gostaria de solicitar um orçamento para o evento:

• Responsável: ${name}
• Contratante / Empresa: ${company || 'Não informado'}
• E-mail: ${email}
• WhatsApp / Telefone: ${phone}
• Tipo de Evento: ${kind}
• Data Prevista: ${date || 'A definir'}

• Infraestrutura Solicitada:
${details || 'Sem detalhes adicionais'}
`;

    const mailtoUrl = `mailto:${comp.email}?subject=${subject}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;

    showToast("Abrindo seu aplicativo de e-mail...");
  });
}

function initAuthModal() {
  const backdrop = document.getElementById("authBackdrop");
  const openButtons = document.querySelectorAll(".btn-open-login");
  const closeBtn = document.getElementById("authCloseBtn");
  const authForm = document.getElementById("authForm");
  const authError = document.getElementById("authError");

  if (!backdrop) return;

  openButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      backdrop.classList.add("open");
      if (authError) authError.style.display = "none";
      document.getElementById("authUsername")?.focus();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", () => backdrop.classList.remove("open"));
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.remove("open");
  });

  if (authForm) {
    authForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("authUsername").value.trim().toLowerCase();
      const pass = document.getElementById("authPassword").value.trim();

      if ((user === "sonovolt" || user === "admin") && (pass === "sonovolt2026" || pass === "123456")) {
        sessionStorage.setItem("sonovolt_authenticated", "true");
        sessionStorage.setItem("sonovolt_user", user);
        backdrop.classList.remove("open");
        
        // Ativa o modo de edição na própria página!
        isEditMode = true;
        enableLiveEditor();
        renderPortfolio(activeConfig, "all");
        showToast("🎨 Modo Editor Visual ativado! Clique nos textos para editar e nas fotos para trocar.");
      } else {
        if (authError) {
          authError.textContent = "Usuário ou senha incorretos.";
          authError.style.display = "block";
        }
      }
    });
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4500);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
