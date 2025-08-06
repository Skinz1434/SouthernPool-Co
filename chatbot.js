/**
 * LIVE CHAT WIDGET - Southern Pool Co
 * Mock chatbot with localStorage persistence
 */

class SouthernPoolChatbot {
  constructor() {
    this.isOpen = false;
    this.messages = this.loadChatHistory();
    this.responses = this.getResponseDatabase();
    this.currentTypingTimeout = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderMessages();
    
    // Show initial greeting if no previous chat
    if (this.messages.length === 0) {
      this.addBotMessage("👋 Hi there! I'm here to help with your pool questions. How can I assist you today?");
    }
  }

  bindEvents() {
    // Toggle chat
    window.toggleChat = () => this.toggleChat();
    window.sendMessage = (e) => this.sendMessage(e);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.toggleChat();
      }
    });
  }

  toggleChat() {
    const widget = document.getElementById('chatbot');
    const toggle = document.getElementById('chatToggle');
    
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      widget.classList.add('active');
      widget.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      
      // Focus on input
      setTimeout(() => {
        document.getElementById('chatInput').focus();
      }, 300);
      
    } else {
      widget.classList.remove('active');
      widget.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  async sendMessage(e) {
    e.preventDefault();
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addUserMessage(message);
    input.value = '';
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Simulate thinking time
    const delay = Math.random() * 1500 + 800;
    
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateResponse(message);
      this.addBotMessage(response);
    }, delay);
  }

  addUserMessage(text) {
    const message = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(message);
    this.saveChatHistory();
    this.renderMessage(message);
    this.scrollToBottom();
  }

  addBotMessage(text, isTyping = false) {
    if (!isTyping) {
      const message = {
        id: Date.now(),
        type: 'bot',
        text: text,
        timestamp: new Date().toISOString()
      };
      
      this.messages.push(message);
      this.saveChatHistory();
      this.renderMessage(message);
    } else {
      this.renderTypingMessage(text);
    }
    
    this.scrollToBottom();
  }

  renderMessages() {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '';
    
    this.messages.forEach(message => {
      this.renderMessage(message);
    });
    
    this.scrollToBottom();
  }

  renderMessage(message) {
    const container = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.type}-message`;
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${this.formatMessage(message.text)}</p>
        ${message.type === 'bot' ? '<small style="opacity: 0.7; font-size: 0.8em; margin-top: 0.5rem; display: block;">SouthernPool Assistant</small>' : ''}
      </div>
    `;
    
    container.appendChild(messageElement);
    
    // Animate in
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      messageElement.style.transition = 'all 0.3s ease';
      messageElement.style.opacity = '1';
      messageElement.style.transform = 'translateY(0)';
    });
  }

  showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot-message typing-indicator';
    typingElement.id = 'typing-indicator';
    typingElement.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    container.appendChild(typingElement);
    
    // Add CSS for typing animation
    const style = document.createElement('style');
    style.textContent = `
      .typing-dots {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 0;
      }
      .typing-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.4;
        animation: typingBounce 1.4s infinite ease-in-out;
      }
      .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
      .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(1); opacity: 0.4; }
        40% { transform: scale(1.2); opacity: 1; }
      }
    `;
    if (!document.getElementById('typing-styles')) {
      style.id = 'typing-styles';
      document.head.appendChild(style);
    }
    
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Keywords matching with responses
    for (const [keywords, responses] of Object.entries(this.responses)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        const responseArray = Array.isArray(responses) ? responses : [responses];
        return responseArray[Math.floor(Math.random() * responseArray.length)];
      }
    }
    
    // Default responses for unmatched queries
    const defaultResponses = [
      "That's a great question! For detailed information about that, I'd recommend speaking with one of our pool experts. You can request a free consultation through our quote form below. 📋",
      "I'd love to help you with that! Our team has extensive experience with all types of pool projects. Would you like to schedule a consultation to discuss your specific needs? 🏊‍♂️",
      "Thanks for asking! Each pool project is unique, so our experts would need to assess your specific situation. You can reach out via our quote form for personalized assistance. 💬",
      "That's definitely something our experienced team can help with! For the most accurate information, I'd suggest requesting a free quote where we can discuss all the details. ✨"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  getResponseDatabase() {
    return {
      // Pricing questions
      [['price', 'cost', 'expensive', 'budget', 'how much', 'pricing', '$']]: [
        "Pool costs vary based on size, features, and location. Our pools typically range from $40,000-$150,000+ depending on customization. Request a free quote for an accurate estimate! 💰",
        "Great question! Pricing depends on many factors like size, materials, and features. We offer transparent pricing with no surprises. Let's discuss your budget in a free consultation! 📊",
        "Pool investment varies widely based on your vision. We work with various budgets and offer financing options. Request a quote to get your personalized pricing! 💳"
      ],
      
      // Timeline questions  
      [['time', 'timeline', 'how long', 'duration', 'weeks', 'months']]: [
        "Most pools take 6-12 weeks from start to finish, depending on size and complexity. Weather can affect timeline too. We'll give you a detailed schedule during consultation! ⏰",
        "Timeline varies by project, but typically 8-10 weeks for standard installations. Custom designs may take longer. We keep you updated every step of the way! 📅",
        "Great planning question! Construction usually takes 2-3 months including permits and weather delays. We'll provide a detailed timeline with your quote! 🗓️"
      ],
      
      // Pool types
      [['type', 'kind', 'fiberglass', 'concrete', 'vinyl', 'gunite', 'infinity', 'lap pool']]: [
        "We specialize in custom concrete/gunite pools that can be shaped to fit any design! We also do fiberglass and vinyl options. What style are you considering? 🏊‍♀️",
        "Concrete pools offer the most customization - any shape, size, or feature you can imagine! They're built to last in Louisiana's climate. Want to see some examples? 🎨",
        "Each pool type has advantages! Concrete for custom shapes, fiberglass for quick install, vinyl for budget-friendly. We'll help you choose what's perfect for your needs! ⭐"
      ],
      
      // Maintenance
      [['maintenance', 'clean', 'upkeep', 'service', 'chemicals']]: [
        "We offer full maintenance services so you can just enjoy swimming! Our smart pool technology also makes self-maintenance much easier. 🧽✨",
        "Modern pools are easier to maintain than ever! We include training on care and offer ongoing service plans. Plus, our automated systems do most of the work! 🤖",
        "Pool maintenance has come a long way! With proper equipment and our service plans, it's minimal work. We'll set you up for success! 🔧"
      ],
      
      // Features
      [['features', 'waterfall', 'lights', 'heating', 'spa', 'hot tub', 'automation', 'smart']]: [
        "We love adding special features! Waterfalls, LED lighting, heating, spas, automation - the sky's the limit! What features are you dreaming about? 🌟",
        "Our smart pool technology is amazing - control everything from your phone! Lights, temperature, cleaning cycles, even water chemistry. Very popular! 📱",
        "Features make your pool unique! We do custom lighting, waterfalls, spas, fire features, and full automation. Let's design something spectacular! 🎆"
      ],
      
      // Location/Service area  
      [['location', 'where', 'area', 'baton rouge', 'louisiana', 'lafayette', 'new orleans']]: [
        "We serve all of Louisiana! Based in Baton Rouge but we travel throughout the state. We're familiar with local climate and regulations everywhere! 🗺️",
        "Louisiana is our home! We've been building pools across the state since 1985. Local expertise makes a big difference in construction and design! 🏡",
        "We cover the whole state of Louisiana! From New Orleans to Shreveport and everywhere between. Local knowledge is key to lasting pools! 🌴"
      ],
      
      // Company info
      [['about', 'experience', 'family', 'business', 'reviews', 'reputation']]: [
        "We're a family-owned Louisiana business since 1985! Three generations of pool expertise with hundreds of happy customers. Check out our testimonials above! 👨‍👩‍👧‍👦",
        "SouthernPool Co has been Louisiana's trusted pool builder for almost 40 years! Family values, premium quality, and treating every customer like family. 🏆",
        "We're proud Louisiana natives who've been perfecting pools since 1985! Our reputation is built on quality work and happy families. See our reviews! ⭐⭐⭐⭐⭐"
      ],
      
      // Weather/Seasons
      [['weather', 'season', 'winter', 'summer', 'hurricane', 'climate']]: [
        "Louisiana weather is perfect for pools most of the year! We build with hurricanes and heat in mind - proper engineering for our climate! 🌡️",
        "Pool season in Louisiana is basically year-round with heating! We design for our weather patterns and build to withstand storms. 💪",
        "Great question! We build pools specifically for Louisiana's unique climate. Hurricane-resistant construction and systems that handle heat and humidity! 🌀"
      ],
      
      // Greetings
      [['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']]: [
        "Hello! Welcome to SouthernPool Co! I'm here to help answer your pool questions. What would you like to know? 😊",
        "Hi there! Thanks for your interest in our pools! How can I help make your backyard dreams come true? 🌟",
        "Hey! Great to meet you! I'm excited to help you explore pool options. What brings you here today? 🏊‍♂️"
      ],
      
      // Thank you
      [['thank', 'thanks', 'appreciate']]: [
        "You're very welcome! That's what we're here for. Any other questions about pools? 😊",
        "Happy to help! Feel free to ask anything else or request a quote when you're ready! 🙂",
        "My pleasure! We love talking about pools. What else would you like to know? ✨"
      ],
      
      // Consultation
      [['consultation', 'quote', 'estimate', 'visit', 'appointment']]: [
        "I'd love to set that up! Just fill out our quote form below and we'll contact you within 24 hours to schedule your free consultation! 📋",
        "Perfect! Our free consultations include site assessment and custom design ideas. Use the quote form below to get started! 🎯",
        "Absolutely! We offer free, no-pressure consultations where we discuss your vision and provide accurate estimates. Ready to schedule? 📞"
      ]
    };
  }

  formatMessage(text) {
    // Simple emoji and text formatting
    return text
      .replace(/:\)/g, '😊')
      .replace(/:\(/g, '😞') 
      .replace(/<3/g, '❤️')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  scrollToBottom() {
    const container = document.getElementById('chatMessages');
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  loadChatHistory() {
    try {
      const saved = localStorage.getItem('southernpool_chat');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load chat history');
      return [];
    }
  }

  saveChatHistory() {
    try {
      // Only keep last 50 messages for performance
      const recentMessages = this.messages.slice(-50);
      localStorage.setItem('southernpool_chat', JSON.stringify(recentMessages));
    } catch (error) {
      console.warn('Failed to save chat history');
    }
  }

  // Public API for integration
  send(message) {
    const input = document.getElementById('chatInput');
    input.value = message;
    const form = input.closest('form');
    form.dispatchEvent(new Event('submit'));
  }

  clear() {
    this.messages = [];
    localStorage.removeItem('southernpool_chat');
    this.renderMessages();
    this.addBotMessage("Chat cleared! How can I help you today? 😊");
  }

  // Analytics tracking
  trackInteraction(action, message = '') {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'chat_interaction', {
        event_category: 'engagement',
        event_label: action,
        value: message.length
      });
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chatbot = new SouthernPoolChatbot();
  
  // Expose simple API
  window.chatbot.send = window.chatbot.send.bind(window.chatbot);
  window.chatbot.clear = window.chatbot.clear.bind(window.chatbot);
  
  console.log('🤖 SouthernPool Chatbot ready! Try: chatbot.send("Hello!")');
});