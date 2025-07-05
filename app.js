
// Main application state
let messages = [];
let selectedImage = null;
let imagePreview = null;
let isLoading = false;

// DOM elements
let messagesContainer;
let messageInput;
let sendBtn;
let attachBtn;
let fileInput;
let clearBtn;
let imagePreviewContainer;
let previewImg;
let removeImageBtn;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  loadConfigStyles();
  loadChatHistory();
  setupEventListeners();
  showWelcomeMessage();
});

function initializeElements() {
  messagesContainer = document.getElementById('messages');
  messageInput = document.getElementById('message-input');
  sendBtn = document.getElementById('send-btn');
  attachBtn = document.getElementById('attach-btn');
  fileInput = document.getElementById('file-input');
  clearBtn = document.getElementById('clear-btn');
  imagePreviewContainer = document.getElementById('image-preview');
  previewImg = document.getElementById('preview-img');
  removeImageBtn = document.getElementById('remove-image');
}

function setupEventListeners() {
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', handleKeyPress);
  messageInput.addEventListener('input', updateSendButton);
  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleImageSelect);
  removeImageBtn.addEventListener('click', removeImage);
  clearBtn.addEventListener('click', clearHistory);
}

function handleKeyPress(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function updateSendButton() {
  sendBtn.disabled = !messageInput.value.trim() && !selectedImage;
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target.result;
      previewImg.src = imagePreview;
      imagePreviewContainer.style.display = 'inline-block';
      updateSendButton();
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  selectedImage = null;
  imagePreview = null;
  fileInput.value = '';
  imagePreviewContainer.style.display = 'none';
  updateSendButton();
}

function showWelcomeMessage() {
  if (messages.length === 0) {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    
    const avatar = createAIAvatar();
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const welcomeText = config.prompts.welcome
      .replace(/{AI_NAME}/g, `<span style="color: ${config.appearance.primaryColor}">${config.ai.name}</span>`)
      .replace(/{CREATOR}/g, `<span style="color: ${config.appearance.primaryColor}">${config.ai.creator}</span>`);
    
    content.innerHTML = `<p>${welcomeText}</p>`;
    
    welcomeDiv.appendChild(avatar);
    welcomeDiv.appendChild(content);
    messagesContainer.appendChild(welcomeDiv);
  }
}

function createAIAvatar() {
  const avatar = document.createElement('div');
  avatar.className = 'ai-avatar';
  
  if (config.ai.iconType === 'image' && config.ai.iconImage) {
    const img = document.createElement('img');
    img.src = config.ai.iconImage;
    img.alt = 'AI Avatar';
    avatar.appendChild(img);
  } else {
    avatar.textContent = config.ai.icon;
  }
  
  return avatar;
}

async function sendMessage() {
  if (!messageInput.value.trim() && !selectedImage) return;

  const userMessage = {
    id: Date.now().toString(),
    content: messageInput.value,
    sender: 'user',
    timestamp: new Date(),
    image: imagePreview || undefined
  };

  messages.push(userMessage);
  addMessageToDOM(userMessage);
  
  const currentInput = messageInput.value;
  messageInput.value = '';
  setLoading(true);
  updateSendButton();

  try {
    // Convert chat history to API format
    const chatHistory = messages.slice(-config.features.maxHistoryMessages).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add current message
    chatHistory.push({
      role: 'user',
      content: currentInput
    });

    // Convert image to base64 if present
    let imageBase64;
    if (selectedImage) {
      try {
        imageBase64 = await convertImageToBase64(selectedImage);
      } catch (error) {
        console.error('Error converting image:', error);
      }
    }

    // Call API
    const response = await sendToGroq(chatHistory, imageBase64);

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: 'ai',
      timestamp: new Date()
    };

    messages.push(aiMessage);
    addMessageToDOM(aiMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = {
      id: (Date.now() + 1).toString(),
      content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
      sender: 'ai',
      timestamp: new Date()
    };
    messages.push(errorMessage);
    addMessageToDOM(errorMessage);
  } finally {
    setLoading(false);
    removeImage();
    saveChatHistory();
  }
}

function addMessageToDOM(message) {
  // Remove welcome message if it exists
  const welcomeMessage = messagesContainer.querySelector('.welcome-message');
  if (welcomeMessage && messages.length > 0) {
    welcomeMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${message.sender}`;
  
  if (message.sender === 'ai') {
    const avatar = createAIAvatar();
    messageDiv.appendChild(avatar);
  }
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  if (message.image) {
    const img = document.createElement('img');
    img.src = message.image;
    img.alt = 'Anexo';
    img.className = 'message-image';
    content.appendChild(img);
  }
  
  const text = document.createElement('p');
  text.innerHTML = message.content
    .replace(/\*\*Siri IA\*\*/g, 'Siri IA')
    .replace(/\*\*Darkness\*\*/g, 'Darkness');
  content.appendChild(text);
  
  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.textContent = formatTime(message.timestamp);
  content.appendChild(timestamp);
  
  messageDiv.appendChild(content);
  messagesContainer.appendChild(messageDiv);
  
  scrollToBottom();
}

function setLoading(loading) {
  isLoading = loading;
  
  if (loading) {
    // Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typing-indicator';
    
    const avatar = createAIAvatar();
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    
    content.appendChild(indicator);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(content);
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
  } else {
    // Remove typing indicator
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function clearHistory() {
  messages = [];
  messagesContainer.innerHTML = '';
  localStorage.removeItem('chat-history');
  showWelcomeMessage();
}

function saveChatHistory() {
  localStorage.setItem('chat-history', JSON.stringify(messages));
}

function loadChatHistory() {
  const savedMessages = localStorage.getItem('chat-history');
  if (savedMessages) {
    try {
      messages = JSON.parse(savedMessages).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      messages.forEach(message => {
        addMessageToDOM(message);
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }
}
