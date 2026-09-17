/* Static UI strings (navigation, section titles, buttons).
   Content data (profile, articles) lives in the *.json files instead. */
const UI = {
  ar: {
    navHome: "الرئيسية",
    navArticles: "المقالات",
    navAI: "الذكاء الاصطناعي والتخطيط",
    heroDownloadCV: "تحميل السيرة الذاتية",
    heroContact: "تواصل معي",
    heroLinkedin: "صفحتي على LinkedIn",
    summaryTitle: "نبذة عني",
    experienceTitle: "الخبرات العملية",
    skillsTitle: "المهارات التقنية",
    certTitle: "الشهادات والعضويات المهنية",
    educationTitle: "المؤهل الدراسي",
    languagesTitle: "اللغات",
    contactTitle: "التواصل",
    contactEmail: "البريد الإلكتروني",
    contactLinkedin: "LinkedIn",
    contactLinkedinLabel: "عرض الملف الشخصي",
    contactPhone: "الهاتف",
    articlesPageTitle: "المقالات",
    articlesPageSub: "مقالات في التخطيط والجدولة وإدارة المشاريع",
    aiPageTitle: "الذكاء الاصطناعي والتخطيط",
    aiPageSub: "مقالات عن تطبيقات الذكاء الاصطناعي في هندسة التخطيط والجدولة",
    readMore: "قراءة المقال",
    backToList: "الرجوع لكل المقالات",
    emptyArticles: "لا توجد مقالات منشورة بعد. تابع قريبًا.",
    footerText: "© {year} عبدالرحمن ماجد. جميع الحقوق محفوظة.",
    chatTitle: "اسأل عبدالرحمن",
    chatSubtitle: "مساعد يجاوب على أسئلة شائعة عن الخبرة والمهارات",
    chatPlaceholder: "اكتب سؤالك هنا...",
    chatSend: "إرسال",
    chatWelcome: "أهلاً! تقدر تسألني عن الخبرة، المهارات، الشهادات، أو طريقة التواصل.",
    chatFallback: "معنديش إجابة جاهزة لده حاليًا. تقدر تتواصل مباشرة عبر البريد الإلكتروني أو LinkedIn في قسم التواصل.",
    chipExperience: "خبرتك الحالية؟",
    chipSkills: "أهم مهاراتك؟",
    chipCert: "الشهادات؟",
    chipContact: "إزاي أتواصل معاك؟"
  },
  en: {
    navHome: "Home",
    navArticles: "Articles",
    navAI: "AI in Planning",
    heroDownloadCV: "Download CV",
    heroContact: "Contact Me",
    heroLinkedin: "View LinkedIn",
    summaryTitle: "About Me",
    experienceTitle: "Experience",
    skillsTitle: "Technical Skills",
    certTitle: "Certifications & Memberships",
    educationTitle: "Education",
    languagesTitle: "Languages",
    contactTitle: "Contact",
    contactEmail: "Email",
    contactLinkedin: "LinkedIn",
    contactLinkedinLabel: "View Profile",
    contactPhone: "Phone",
    articlesPageTitle: "Articles",
    articlesPageSub: "Articles on planning, scheduling, and project controls",
    aiPageTitle: "AI in Planning",
    aiPageSub: "Articles on applying artificial intelligence to planning & scheduling engineering",
    readMore: "Read Article",
    backToList: "Back to all articles",
    emptyArticles: "No articles published yet. Check back soon.",
    footerText: "© {year} Abdulrahman Maged. All rights reserved.",
    chatTitle: "Ask Abdulrahman",
    chatSubtitle: "Assistant answering common questions about experience & skills",
    chatPlaceholder: "Type your question...",
    chatSend: "Send",
    chatWelcome: "Hi! Ask me about experience, skills, certifications, or how to get in touch.",
    chatFallback: "I don't have a ready answer for that yet. You can reach out directly via email or LinkedIn in the Contact section.",
    chipExperience: "Current role?",
    chipSkills: "Top skills?",
    chipCert: "Certifications?",
    chipContact: "How to contact you?"
  }
};

function getLang(){
  return localStorage.getItem("site-lang") || "ar";
}
function setLang(lang){
  localStorage.setItem("site-lang", lang);
  applyLangToDocument(lang);
}
function applyLangToDocument(lang){
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}
function t(key){
  const lang = getLang();
  return (UI[lang] && UI[lang][key]) || key;
}
