
const config = {
  appearance: {
    primaryColor: "#ffffff",
    backgroundColor: "#000000",
    borderColor: "#ffffff",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    userMessageBackground: "#000000",
    aiMessageBackground: "#000000",
    inputBackground: "#000000",
    buttonColor: "#000000",
    buttonHoverColor: "#ffffff",
    timestampColor: "#ffffff",
    placeholderColor: "#ffffff",
    scrollbarColor: "#ffffff"
  },
  ai: {
    name: "Siri IA",
    icon: "🟢",
    iconType: "image",
    iconImage: "https://img.freepik.com/vetores-premium/criar-uma-imagem-simples-representando-uma-marca-que-oferece-solucoes-de-ia_992397-5704.jpg?w=2000",
    creator: "Darkness"
  },
  header: {
    title: "Siri IA",
    showClearButton: true
  },
  api: {
    key: "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",
    model: "llama3-8b-8192",
    temperature: 0.4,
    maxTokens: 5000
  },
  prompts: {
    system: "Você é o {AI_NAME}, criado pelo {CREATOR}. Você pode ajudar com programação, criação de sites, resolução de problemas e muito mais. Responda de forma útil e amigável em português. Quando uma imagem for fornecida, descreva o que você vê e responda às perguntas sobre ela. Sempre que mencionar \"{AI_NAME}\" ou \"{CREATOR}\", use a cor configurada no primaryColor.",
    welcome: "Olá! Sou o {AI_NAME}, criado pelo {CREATOR}. Posso te ajudar com programação, criação de sites, resolução de problemas e muito mais. Como posso te ajudar hoje?"
  },
  features: {
    maxHistoryMessages: 10
  }
};

function loadConfigStyles() {
  const root = document.documentElement;
  
  root.style.setProperty('--primary-color', config.appearance.primaryColor);
  root.style.setProperty('--background-color', config.appearance.backgroundColor);
  root.style.setProperty('--border-color', config.appearance.borderColor);
  root.style.setProperty('--text-color', config.appearance.textColor);
  root.style.setProperty('--accent-color', config.appearance.accentColor);
  root.style.setProperty('--user-message-bg', config.appearance.userMessageBackground);
  root.style.setProperty('--ai-message-bg', config.appearance.aiMessageBackground);
  root.style.setProperty('--input-background', config.appearance.inputBackground);
  root.style.setProperty('--button-color', config.appearance.buttonColor);
  root.style.setProperty('--button-hover-color', config.appearance.buttonHoverColor);
  root.style.setProperty('--timestamp-color', config.appearance.timestampColor);
  root.style.setProperty('--placeholder-color', config.appearance.placeholderColor);
  root.style.setProperty('--scrollbar-color', config.appearance.scrollbarColor);
}
