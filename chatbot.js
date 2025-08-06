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
      this.showQuickActions();
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
      
      // Consultation & Quote Requests - Enhanced with contact options
      [['consultation', 'quote', 'estimate', 'visit', 'appointment', 'free quote', 'request quote']]: [
        "I'd love to help you get started! Here are your options to request a free quote:\n\n📱 **Call/Text**: (225) 555-POOL\n📧 **Email**: hello@southernpoolco.com\n📋 **Online Form**: Scroll down to our quote form\n👥 **Facebook**: Visit our Facebook page\n\nWhich works best for you? All options get you a free consultation within 24 hours! 🎯",
        "Perfect! Let's get your free quote started. You can reach us:\n\n☎️ **Phone**: (225) 555-POOL - call anytime!\n💬 **Text**: Same number for quick questions\n📧 **Email**: hello@southernpoolco.com\n📋 **Quote Form**: Fill out the form below\n📘 **Facebook**: Message us on Facebook\n\nAll methods get same-day response! What's most convenient? ⭐",
        "Absolutely! Free consultations are our specialty. Contact us however you prefer:\n\n📞 **Call Now**: (225) 555-POOL\n💬 **Text Quick**: (225) 555-POOL\n📧 **Email Details**: hello@southernpoolco.com\n📋 **Online Form**: Below on this page\n👍 **Facebook**: Find us @SouthernPoolCompany\n\nWe respond within hours, not days! Ready to start? 🚀"
      ],

      // Contact Information - New category
      [['contact', 'phone', 'call', 'text', 'email', 'reach you', 'get in touch', 'facebook']]: [
        "Here's how to reach us - we're very responsive!\n\n📱 **Phone/Text**: (225) 555-POOL\n📧 **Email**: hello@southernpoolco.com\n📘 **Facebook**: @SouthernPoolCompany\n📍 **Location**: Baton Rouge, Louisiana\n\nBest response times: Phone/Text (immediate), Email (within 2 hours), Facebook (same day). How would you like to connect? 😊",
        "We make it easy to get in touch!\n\n☎️ **Call**: (225) 555-POOL - we actually answer!\n💬 **Text**: Same number for quick questions\n✉️ **Email**: hello@southernpoolco.com\n👥 **Facebook**: Search 'Southern Pool Company'\n\nI recommend calling or texting for fastest response. What questions can I help with right now? 🤝"
      ],

      // Phone/Text specific
      [['phone number', 'call you', 'text you', 'number']]: [
        "Our phone number is **(225) 555-POOL** - that's (225) 555-7665!\n\n📞 **Call anytime** - we love talking pools!\n💬 **Text us** - great for quick questions\n\nWe typically answer within minutes during business hours (7 AM - 7 PM). After hours? We'll call you back first thing in the morning! 📱",
        "**Phone: (225) 555-POOL**\n\nThat number works for both calls and texts! We're usually available:\n• **Monday-Friday**: 7 AM - 7 PM\n• **Saturday**: 8 AM - 5 PM\n• **Sunday**: By appointment\n\nEmergency? Text us anytime - we monitor 24/7! 🚨"
      ],

      // Email specific  
      [['email', 'email address', 'send email']]: [
        "Our email is **hello@southernpoolco.com**\n\n📧 We typically respond within 2 hours during business days!\n📎 Feel free to attach photos of your yard or inspiration pictures\n📝 Include your phone number for faster follow-up\n\nEmail is great for detailed questions and sending photos. What would you like to know? ✉️",
        "**Email us at: hello@southernpoolco.com**\n\n✅ **Quick response** - usually within 2 hours\n📷 **Send photos** - we love seeing your space!\n📋 **Detailed questions** - we'll give thorough answers\n\nPro tip: Include your phone number so we can call with quick clarifications! 📞"
      ],

      // Financing
      [['financing', 'payment', 'loan', 'monthly payment', 'afford', 'payment plan']]: [
        "Great question about financing! We offer several options to make your dream pool affordable:\n\n💳 **Pool Financing**: Low monthly payments\n🏦 **Multiple Lenders**: We work with several finance companies\n📊 **Quick Approval**: Often same-day decisions\n💰 **Competitive Rates**: As low as 6.99% APR qualified buyers\n\nWant details? Call (225) 555-POOL and we'll discuss options that fit your budget! 💵",
        "Yes! We make pools affordable with great financing:\n\n✅ **Low monthly payments** starting around $200-300/month\n✅ **Multiple term options** (5-20 years)\n✅ **Quick online applications** with fast approval\n✅ **No prepayment penalties**\n\nEvery situation is different - call (225) 555-POOL to discuss what works for your budget! 🎯"
      ],

      // Warranty
      [['warranty', 'guarantee', 'problems', 'issues', 'repair']]: [
        "Our warranty is one of the best in Louisiana!\n\n🛡️ **Structural**: 25+ years on concrete/gunite\n⚡ **Equipment**: 1-3 years depending on component\n🔧 **Workmanship**: 2 years on all installation\n🏆 **Service**: Lifetime relationship - we're always here!\n\nWe stand behind every pool 100%. Any issues? Call (225) 555-POOL immediately! 🔨",
        "We guarantee your satisfaction!\n\n✅ **Industry-leading warranties** on all components\n✅ **Quick response** for any issues\n✅ **Local service** - we're not going anywhere!\n✅ **Fair pricing** on any needed repairs\n\nAlmost 40 years in business means we handle problems right the first time! Peace of mind included! 😌"
      ],

      // Pool Safety
      [['safety', 'kids', 'children', 'fence', 'alarm', 'cover']]: [
        "Pool safety is OUR TOP PRIORITY, especially with kids!\n\n👶 **Safety Features We Include**:\n🚧 **Proper fencing** - required by law\n🚨 **Pool alarms** - motion sensors available\n🛡️ **Safety covers** - automated options\n🚪 **Self-closing gates** - spring hinges\n⚡ **GFCI protection** - electrical safety\n\nAs a family business, we design every pool thinking about children's safety first! Questions? Call (225) 555-POOL! 👨‍👩‍👧‍👦",
        "Safety first - always! Here's what we provide:\n\n✅ **Code-compliant fencing** around every pool\n✅ **Pool alarms** - detect unexpected entry\n✅ **Non-slip surfaces** - safer deck materials\n✅ **Proper lighting** - see everything clearly\n✅ **Safety training** - we teach you proper protocols\n\nWe've built pools for hundreds of families with kids. Your family's safety is our responsibility! 🛡️"
      ],

      // Pool Permits & Legal
      [['permit', 'permits', 'legal', 'city', 'approval', 'zoning', 'setback', 'inspection']]: [
        "Don't worry - we handle ALL permits and inspections!\n\n📋 **We Take Care Of**:\n🏛️ Building permits with city/parish\n📏 Setback and zoning compliance\n🔍 All required inspections\n⚡ Electrical permits and connections\n🚰 Plumbing permits if needed\n\nPermit costs are included in your quote. We know every parish's requirements in Louisiana! 📜",
        "Permits are our responsibility, not yours!\n\n✅ **Full permit service** - we handle everything\n✅ **Local expertise** - know all Louisiana codes\n✅ **Inspection coordination** - we schedule and attend\n✅ **Code compliance** - built right the first time\n\nYou just sign contracts and pick finishes - we do all the paperwork! Over 35 years of permit experience! 🏆"
      ],

      // Pool Equipment & Technology
      [['pump', 'filter', 'heater', 'equipment', 'automation', 'variable speed', 'salt water', 'chlorine']]: [
        "We use only premium equipment for Louisiana conditions!\n\n🔧 **Top Brands We Install**:\n💧 **Pumps**: Pentair variable-speed (energy efficient!)\n🧽 **Filters**: Cartridge or sand - your choice\n🔥 **Heaters**: Gas or heat pump options\n📱 **Automation**: Control everything from your phone!\n🧂 **Salt Systems**: Gentler than chlorine\n\nAll equipment comes with manufacturer warranties. Want specifics? Call (225) 555-POOL! ⚙️",
        "Equipment quality matters for Louisiana's tough climate!\n\n✅ **Variable-speed pumps** - save $600+ yearly on electricity\n✅ **Premium filtration** - crystal clear water always\n✅ **Smart automation** - phone app control\n✅ **Salt water systems** - no harsh chemicals\n✅ **Efficient heaters** - swim year-round!\n\nWe only install equipment we'd put in our own pools! Quality first! 💪"
      ],

      // Pool Materials & Finishes
      [['concrete', 'gunite', 'fiberglass', 'vinyl', 'plaster', 'tile', 'finish', 'surface', 'pebble']]: [
        "We offer several beautiful finish options!\n\n🎨 **Popular Finishes**:\n✨ **Plaster**: Classic white or colored\n🪨 **Pebble**: Natural stone texture\n🌊 **Glass**: Sparkly, premium look\n🧱 **Tile**: Mosaic waterline options\n💎 **Quartz**: Durable and gorgeous\n\nEach has different looks, feels, and costs. Want to see samples? We bring them to your consultation! 🎯",
        "Your pool finish makes all the difference!\n\n🏊 **Most Popular**: Pebble finishes - durable and beautiful\n⭐ **Premium**: Glass bead - sparkles in sunlight\n🔸 **Classic**: Plaster - traditional and affordable\n🎨 **Custom**: Mosaic tile - unlimited designs\n\nWe'll show you samples and explain pros/cons of each. Call (225) 555-POOL to see options! 🌈"
      ],

      // Pool Shapes & Sizes
      [['shape', 'size', 'design', 'custom', 'rectangular', 'kidney', 'freeform', 'round', 'lap pool']]: [
        "Any shape you can dream, we can build!\n\n🏊 **Popular Shapes**:\n📐 **Rectangular**: Classic, great for laps\n🫘 **Kidney**: Curved, natural look\n🌊 **Freeform**: Organic, resort-style\n⭕ **Round/Oval**: Space-efficient\n🏃 **Lap Pools**: Long and narrow for exercise\n🎨 **Custom**: Your imagination is the limit!\n\nConcrete/gunite pools can be ANY shape. What's your dream design? 🎯",
        "We specialize in custom shapes that fit YOUR space!\n\n✅ **Any size** - from small plunge pools to resort-style\n✅ **Any shape** - we're artists with concrete!\n✅ **Site-specific** - work around trees, slopes, utilities\n✅ **Family-focused** - shallow end for kids, deep for adults\n\nShow us your yard and we'll design something perfect! Free consultation: (225) 555-POOL! 📐"
      ],

      // Pool Accessories & Features
      [['waterfall', 'slide', 'diving board', 'spa', 'hot tub', 'fire', 'lighting', 'deck jets', 'bubbler']]: [
        "Pool features make your backyard a resort!\n\n🌟 **Popular Add-Ons**:\n💦 **Waterfalls**: Rock or sheer descent\n🛝 **Slides**: Kids love them!\n🏊 **Diving boards**: Classic fun\n🛁 **Attached spas**: Perfect for relaxation\n🔥 **Fire features**: Bowls or pits\n💡 **LED lighting**: Color-changing magic\n✨ **Deck jets**: Arcing water streams\n🫧 **Bubblers**: Kids' shallow-end fun\n\nWhat features excite you most? 🎆",
        "Let's make your pool extraordinary!\n\n🌊 **Water Features**: Waterfalls, fountains, deck jets\n🔥 **Fire & Light**: LED colors, fire bowls, torches\n🏊 **Fun Stuff**: Slides, diving boards, basketball hoops\n🛁 **Relaxation**: Spas, sun shelves, beach entries\n🎵 **Tech**: Underwater speakers, automation\n\nFeatures are what make pools special! What's on your wish list? Call (225) 555-POOL! ⭐"
      ],

      // Landscaping & Decking
      [['deck', 'decking', 'landscaping', 'plants', 'concrete', 'pavers', 'travertine', 'flagstone']]: [
        "Beautiful decking completes your pool!\n\n🪨 **Decking Options**:\n🧱 **Stamped concrete**: Affordable, many patterns\n🪨 **Natural stone**: Travertine, flagstone\n⬜ **Pavers**: Brick or concrete pavers\n🌴 **Pool-friendly plants**: We can recommend!\n🌺 **Full landscaping**: Transform your whole yard\n\nWe coordinate with landscapers or handle it all ourselves! One-stop pool project! 🌿",
        "Your pool area should be a complete oasis!\n\n✅ **Coordinated design** - pool and deck work together\n✅ **Slip-resistant surfaces** - safety first\n✅ **Heat-resistant materials** - comfortable in Louisiana sun\n✅ **Drainage planning** - no puddles or problems\n\nWe can handle decking, landscaping, outdoor kitchens - everything! Call (225) 555-POOL! 🏡"
      ],

      // Louisiana-Specific
      [['hurricane', 'storm', 'flooding', 'clay soil', 'humidity', 'alligator', 'bayou', 'crawfish']]: [
        "Louisiana pools need special engineering!\n\n🌀 **Hurricane-Ready Construction**:\n💪 Reinforced concrete and steel\n⛲ Proper drainage systems\n🏗️ Foundation designed for clay soil\n🌊 Flood-resistant equipment placement\n🐊 Wildlife-safe fencing (yes, gators!)\n\nWe've been building Louisiana-tough pools since 1985. Local expertise matters! 🏆",
        "Born and raised in Louisiana - we know the challenges!\n\n✅ **Clay soil experts** - proper excavation and backfill\n✅ **Hurricane construction** - built to last through storms\n✅ **Humidity-resistant equipment** - marine-grade where needed\n✅ **Local suppliers** - parts and service nearby\n\nOur pools survive what Louisiana throws at them! That's why we've been here 40 years! ⚜️"
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

  showQuickActions() {
    const container = document.getElementById('chatMessages');
    const actionsElement = document.createElement('div');
    actionsElement.className = 'quick-actions';
    actionsElement.innerHTML = `
      <div class="quick-actions-title">Quick Options:</div>
      <div class="quick-actions-buttons">
        <button onclick="window.chatbot.send('I want a free quote')" class="quick-action-btn">🎯 Get Free Quote</button>
        <button onclick="window.chatbot.send('What are your prices?')" class="quick-action-btn">💰 Pool Pricing</button>
        <button onclick="window.chatbot.send('How long does it take?')" class="quick-action-btn">⏰ Timeline</button>
        <button onclick="window.chatbot.send('What is your phone number?')" class="quick-action-btn">📞 Contact Info</button>
      </div>
    `;
    
    container.appendChild(actionsElement);
    
    // Add CSS for quick actions
    if (!document.getElementById('quick-actions-styles')) {
      const style = document.createElement('style');
      style.id = 'quick-actions-styles';
      style.textContent = `
        .quick-actions {
          margin: 1rem 0;
          padding: 1rem;
          background: rgba(240,179,95,0.1);
          border-radius: 12px;
          border: 1px solid rgba(240,179,95,0.2);
        }
        .quick-actions-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--sunset-gold);
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .quick-actions-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .quick-action-btn {
          background: rgba(240,179,95,0.2);
          border: 1px solid rgba(240,179,95,0.4);
          color: var(--sunset-gold);
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .quick-action-btn:hover {
          background: rgba(240,179,95,0.3);
          border-color: rgba(240,179,95,0.6);
          transform: translateY(-1px);
        }
      `;
      document.head.appendChild(style);
    }
    
    this.scrollToBottom();
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