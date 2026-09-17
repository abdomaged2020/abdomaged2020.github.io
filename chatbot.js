/* Lightweight rule-based FAQ chatbot.
   No external API, no server — matches visitor questions against
   keyword lists and answers using data from profile.json + faq.json.
   To add a new question/answer pair, edit data/faq.json — no code changes needed. */

let __faqData = [];

function buildWidget(){
  const lang = getLang();

  const toggle = document.createElement("button");
  toggle.id = "chatbot-toggle";
  toggle.setAttribute("aria-label", "chatbot");
  toggle.textContent = "💬";
  document.body.appendChild(toggle);

  const panel = document.createElement("div");
  panel.id = "chatbot-panel";
  panel.innerHTML = `
    <div class="chatbot-header">
      <div>${t("chatTitle")}<small>${t("chatSubtitle")}</small></div>
      <button class="chatbot-close" id="chatbot-close">✕</button>
    </div>
    <div class="chatbot-messages" id="chatbot-messages"></div>
    <div class="chatbot-suggestions" id="chatbot-suggestions">
      <div class="chip" data-q="chipExperience">${t("chipExperience")}</div>
      <div class="chip" data-q="chipSkills">${t("chipSkills")}</div>
      <div class="chip" data-q="chipCert">${t("chipCert")}</div>
      <div class="chip" data-q="chipContact">${t("chipContact")}</div>
    </div>
    <div class="chatbot-input-row">
      <input type="text" id="chatbot-input" placeholder="${t("chatPlaceholder")}" />
      <button id="chatbot-send">${t("chatSend")}</button>
    </div>
  `;
  document.body.appendChild(panel);

  toggle.onclick = () => {
    panel.classList.toggle("open");
    if(panel.classList.contains("open") && !panel.dataset.greeted){
      addMessage(t("chatWelcome"), "bot");
      panel.dataset.greeted = "1";
    }
  };
  document.getElementById("chatbot-close").onclick = () => panel.classList.remove("open");

  document.getElementById("chatbot-send").onclick = handleSend;
  document.getElementById("chatbot-input").addEventListener("keydown", (e)=>{
    if(e.key === "Enter") handleSend();
  });

  document.querySelectorAll("#chatbot-suggestions .chip").forEach(chip=>{
    chip.onclick = () => {
      const question = t(chip.dataset.q);
      addMessage(question, "user");
      respond(question);
    };
  });
}

function addMessage(text, who){
  const box = document.getElementById("chatbot-messages");
  const div = document.createElement("div");
  div.className = "msg " + (who === "user" ? "msg-user" : "msg-bot");
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function handleSend(){
  const input = document.getElementById("chatbot-input");
  const value = input.value.trim();
  if(!value) return;
  addMessage(value, "user");
  input.value = "";
  respond(value);
}

function matchesAny(text, keywords){
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k.toLowerCase()));
}

function respond(question){
  const lang = getLang();
  const profile = window.__profileData || {};
  const lower = question;

  // Built-in intents based on profile data
  const intents = [
    {
      keywords: ["خبرة", "خبرتك", "تشتغل فين", "شغال فين", "current job", "experience", "employer", "شركة ايه"],
      answer: () => {
        const job = (profile.experience || [])[0];
        if(!job) return null;
        return lang === "ar"
          ? `أعمل حاليًا كـ ${pick(job.role, lang)} في ${job.company} (${pick(job.period, lang)}).`
          : `I currently work as ${pick(job.role, lang)} at ${job.company} (${pick(job.period, lang)}).`;
      }
    },
    {
      keywords: ["مهارات", "مهاراتك", "skills", "تتقن ايه", "خبير في"],
      answer: () => {
        const skills = (profile.skills || []).map(s => pick(s.name, lang));
        if(!skills.length) return null;
        return lang === "ar" ? "أهم مهاراتي: " + skills.join("، ") : "My top skills: " + skills.join(", ");
      }
    },
    {
      keywords: ["شهادات", "شهادة", "عضوية", "certifications", "membership", "sce"],
      answer: () => {
        const certs = (profile.certifications && profile.certifications[lang]) || [];
        if(!certs.length) return null;
        return certs.join(" | ");
      }
    },
    {
      keywords: ["تواصل", "ايميل", "إيميل", "بريد", "لينكدإن", "linkedin", "email", "contact"],
      answer: () => {
        const c = profile.contact || {};
        const parts = [];
        if(c.email) parts.push((lang === "ar" ? "البريد الإلكتروني: " : "Email: ") + c.email);
        if(c.linkedin && c.linkedin.startsWith("http")) parts.push("LinkedIn: " + c.linkedin);
        return parts.length ? parts.join(" — ") : null;
      }
    },
    {
      keywords: ["فين مقيم", "location", "مكان الاقامة", "based", "تعيش فين"],
      answer: () => pick(profile.location, lang) || null
    }
  ];

  for(const intent of intents){
    if(matchesAny(lower, intent.keywords)){
      const ans = intent.answer();
      if(ans){ addMessage(ans, "bot"); return; }
    }
  }

  // Custom FAQ entries from data/faq.json
  for(const item of __faqData){
    if(matchesAny(lower, item.keywords || [])){
      addMessage(pick(item.answer, lang), "bot");
      return;
    }
  }

  addMessage(t("chatFallback"), "bot");
}

window.initChatbot = async function(){
  try{
    __faqData = await loadJSON("data/faq.json");
  }catch(e){
    console.error(e);
  }
  if(!window.__profileData){
    try{
      window.__profileData = await loadJSON("data/profile.json");
    }catch(e){
      console.error(e);
    }
  }
  buildWidget();
};
