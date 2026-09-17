/* Core rendering logic shared across pages. */

async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error("Failed to load " + path);
  return res.json();
}

function pick(field, lang){
  if(field == null) return "";
  if(typeof field === "string") return field;
  return field[lang] || field.ar || field.en || "";
}

/* ---------- Shared chrome: nav labels + lang toggle + footer ---------- */
function renderChrome(){
  const lang = getLang();
  applyLangToDocument(lang);

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });

  const langBtn = document.getElementById("lang-toggle");
  if(langBtn){
    langBtn.textContent = lang === "ar" ? "English" : "عربي";
    langBtn.onclick = () => {
      setLang(lang === "ar" ? "en" : "ar");
      window.location.reload();
    };
  }

  const activePage = document.body.dataset.page;
  document.querySelectorAll(".nav-links a").forEach(a=>{
    a.classList.toggle("active", a.dataset.page === activePage);
  });

  const yearEl = document.getElementById("footer-year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  const footerText = document.getElementById("footer-text");
  if(footerText) footerText.textContent = t("footerText").replace("{year}", new Date().getFullYear());
}

/* ---------- Home page: profile rendering ---------- */
async function renderHome(){
  const lang = getLang();
  let profile;
  try{
    profile = await loadJSON("profile.json");
  }catch(e){
    console.error(e);
    return;
  }

  document.getElementById("hero-name").textContent = pick(profile.name, lang);
  document.getElementById("hero-title").textContent = pick(profile.title, lang);
  document.getElementById("hero-pitch").textContent = pick(profile.pitch, lang);
  document.getElementById("hero-location").textContent = pick(profile.location, lang);

  const photoEl = document.getElementById("hero-photo");
  if(photoEl && profile.photo) photoEl.src = profile.photo;

  const cvBtn = document.getElementById("cv-download");
  if(cvBtn){
    if(profile.cvFile){ cvBtn.href = profile.cvFile; cvBtn.style.display = ""; }
    else { cvBtn.style.display = "none"; }
  }

  const heroLinkedinBtn = document.getElementById("hero-linkedin");
  if(heroLinkedinBtn){
    const heroLinkedinUrl = profile.contact && profile.contact.linkedin;
    if(heroLinkedinUrl && heroLinkedinUrl.startsWith("http")){
      heroLinkedinBtn.href = heroLinkedinUrl;
      heroLinkedinBtn.style.display = "";
    }else{
      heroLinkedinBtn.style.display = "none";
    }
  }

  document.getElementById("summary-text").textContent = pick(profile.summary, lang);

  // Experience timeline
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";
  (profile.experience || []).forEach(job=>{
    const points = (job.points && job.points[lang]) || [];
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.innerHTML = `
      <div class="timeline-head">
        <div>
          <div class="timeline-role">${pick(job.role, lang)}</div>
          <div class="timeline-company">${job.company}</div>
        </div>
        <div class="timeline-period">${pick(job.period, lang)}</div>
      </div>
      <div class="timeline-location">${pick(job.location, lang)}</div>
      <ul class="timeline-points">${points.map(p=>`<li>${p}</li>`).join("")}</ul>
    `;
    timeline.appendChild(item);
  });

  // Skills
  const skillsGrid = document.getElementById("skills-grid");
  skillsGrid.innerHTML = "";
  (profile.skills || []).forEach(skill=>{
    const el = document.createElement("div");
    el.className = "skill-item";
    el.innerHTML = `
      <div class="skill-name"><span>${pick(skill.name, lang)}</span><span>${skill.level}%</span></div>
      <div class="skill-bar-bg"><div class="skill-bar-fill" style="width:${skill.level}%"></div></div>
    `;
    skillsGrid.appendChild(el);
  });

  // Certifications
  const certList = document.getElementById("cert-list");
  certList.innerHTML = "";
  ((profile.certifications && profile.certifications[lang]) || []).forEach(c=>{
    const li = document.createElement("div");
    li.className = "cert-item";
    li.textContent = c;
    certList.appendChild(li);
  });

  // Education
  const eduList = document.getElementById("education-list");
  if(eduList){
    eduList.innerHTML = "";
    ((profile.education && profile.education[lang]) || []).forEach(ed=>{
      const li = document.createElement("div");
      li.className = "cert-item";
      li.textContent = `${ed.degree} — ${ed.school} (${ed.period})`;
      eduList.appendChild(li);
    });
  }

  // Languages
  const langList = document.getElementById("languages-list");
  if(langList){
    langList.innerHTML = "";
    ((profile.languages && profile.languages[lang]) || []).forEach(lg=>{
      const li = document.createElement("div");
      li.className = "cert-item";
      li.textContent = lg;
      langList.appendChild(li);
    });
  }

  // Contact
  const contact = profile.contact || {};
  const emailEl = document.getElementById("contact-email");
  if(contact.email){
    emailEl.href = "mailto:" + contact.email;
    emailEl.textContent = contact.email;
  }
  const linkedinEl = document.getElementById("contact-linkedin");
  if(contact.linkedin){
    linkedinEl.href = contact.linkedin.startsWith("http") ? contact.linkedin : "#";
    linkedinEl.textContent = t("contactLinkedinLabel");
  }
  const phoneCard = document.getElementById("contact-phone-card");
  if(contact.phone){
    document.getElementById("contact-phone").textContent = contact.phone;
    document.getElementById("contact-phone").href = "tel:" + contact.phone;
  }else if(phoneCard){
    phoneCard.style.display = "none";
  }

  window.__profileData = profile; // expose for chatbot
}

/* ---------- Articles pages (planning / ai) ---------- */
async function renderArticlesPage(jsonPath, listId, detailId){
  const lang = getLang();
  let articles = [];
  try{
    articles = await loadJSON(jsonPath);
  }catch(e){
    console.error(e);
  }

  const listEl = document.getElementById(listId);
  const detailEl = document.getElementById(detailId);

  function showList(){
    detailEl.style.display = "none";
    listEl.style.display = "grid";
  }

  function showDetail(article){
    listEl.style.display = "none";
    detailEl.style.display = "block";
    const dateStr = new Date(article.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {year:"numeric", month:"long", day:"numeric"});
    detailEl.innerHTML = `
      <div class="back-link" id="back-to-list">&larr; ${t("backToList")}</div>
      <div class="article-full">
        <div class="article-date">${dateStr}</div>
        <h1 class="article-title">${pick(article.title, lang)}</h1>
        <div class="article-body">${pick(article.content, lang)}</div>
      </div>
    `;
    document.getElementById("back-to-list").onclick = showList;
    window.scrollTo({top:0, behavior:"smooth"});
  }

  if(!articles.length){
    listEl.innerHTML = `<div class="empty-state">${t("emptyArticles")}</div>`;
    return;
  }

  listEl.innerHTML = "";
  articles
    .slice()
    .sort((a,b)=> new Date(b.date) - new Date(a.date))
    .forEach(article=>{
      const dateStr = new Date(article.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {year:"numeric", month:"long", day:"numeric"});
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <div class="article-date">${dateStr}</div>
        <div class="article-title">${pick(article.title, lang)}</div>
        <div class="article-summary">${pick(article.summary, lang)}</div>
        <div class="article-read">${t("readMore")} &larr;</div>
      `;
      card.onclick = () => showDetail(article);
      listEl.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  const page = document.body.dataset.page;
  if(page === "home") renderHome();
  if(page === "articles") renderArticlesPage("articles-planning.json", "articles-list", "article-detail");
  if(page === "ai") renderArticlesPage("articles-ai.json", "articles-list", "article-detail");
  if(window.initChatbot) window.initChatbot();
});
