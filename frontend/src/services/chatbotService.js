// ChatBot Service - Advanced AI Responses
// This service handles intelligent responses based on user queries

export const chatbotService = {
  // Comprehensive keyword mapping for tour-related queries
  keywordMap: {
    destinations: {
      keywords: ['egypt', 'cairo', 'luxor', 'aswan', 'alexandria', 'giza', 'sinai', 'destination', 'place', 'where', 'visit', 'go', 'travel to'],
      category: 'destinations'
    },
    booking: {
      keywords: ['book', 'reserve', 'booking', 'package', 'tour', 'price', 'cost', 'payment', 'reserve', 'purchase', 'buy'],
      category: 'booking'
    },
    activities: {
      keywords: ['activity', 'activities', 'what to do', 'do', 'things', 'experience', 'adventure', 'explore', 'action', 'fun'],
      category: 'activities'
    },
    dates: {
      keywords: ['date', 'when', 'available', 'schedule', 'duration', 'days', 'night', 'months', 'season', 'timing'],
      category: 'dates'
    },
    group: {
      keywords: ['group', 'people', 'person', 'family', 'friend', 'how many', 'passengers', 'travelers', 'team'],
      category: 'group'
    },
    requirements: {
      keywords: ['required', 'need', 'document', 'visa', 'passport', 'requirement', 'prepare', 'bring', 'have'],
      category: 'requirements'
    },
    contact: {
      keywords: ['contact', 'call', 'email', 'phone', 'help', 'support', 'customer service', 'reach', 'connect'],
      category: 'contact'
    }
  },

  // Response templates for different intents
  responses: {
    destinations: {
      default: "🌍 We offer amazing tours to Egypt's most iconic destinations! Here are our popular ones:\n\n📍 **Cairo** - Ancient pyramids, museums, and vibrant culture\n📍 **Luxor** - Temples, tombs, and the Nile\n📍 **Aswan** - Scenic Nile cruises and Nubian culture\n📍 **Alexandria** - Mediterranean beaches and ancient history\n📍 **Sinai** - Desert adventures and mountain scenery\n📍 **Red Sea** - World-class diving and water sports\n\nWould you like detailed information about any of these? 😊",
      cairo: "🏛️ **Cairo - The Heart of Egypt**\n\n✨ Key Attractions:\n🔺 The Great Pyramids of Giza\n🐪 The Egyptian Museum\n🕌 Islamic Cairo & Khan El-Khalili Bazaar\n🌃 Cairo Tower with panoramic views\n\n⏱️ Recommended duration: 3-4 days\n💰 Budget tours from $399\n🌡️ Best time: October - April\n\nReady to book? Let me know! 📝"
    },
    booking: {
      default: "📅 To help you book the perfect tour:\n\n1️⃣ **Choose your destination** - Where would you like to go?\n2️⃣ **Select dates** - When are you planning to travel?\n3️⃣ **Group size** - How many people will be joining?\n4️⃣ **Choose package** - View our available packages\n5️⃣ **Complete booking** - Secure payment and confirmation\n6️⃣ **Confirmation** - Get your voucher via email\n\nLet me help with any step! 🎫"
    },
    activities: {
      default: "🎯 Our tours include fantastic activities:\n\n🏛️ **Cultural & Historical** - Museum tours, temple visits\n🐪 **Adventure** - Desert safaris, quad biking, hot air balloons\n🚤 **Water Activities** - Nile cruises, snorkeling, felucca sailing\n🏕️ **Outdoor** - Hiking, camping, wildlife spotting\n🍽️ **Culinary** - Local cuisine tastings, cooking classes\n🎭 **Entertainment** - Traditional shows, markets, night tours\n👶 **Family-Friendly** - Kid-safe activities and easier pace\n\nWhat interests you most? ✨"
    },
    dates: {
      default: "📆 Perfect! When are you thinking of traveling?\n\n✅ **Best time** - October to April (cool, pleasant weather)\n🌞 **Shoulder season** - May, September (fewer crowds, good prices)\n🌡️ **Summer** - June to August (very hot, budget-friendly)\n⏰ **Typical duration** - 3-7 days for complete experience\n📅 **Minimum stay** - 2 days for quick getaway\n\nTell me your preferred dates and I'll find the best packages! 📝"
    },
    group: {
      default: "👥 Group size helps us customize your experience!\n\n👤 **Solo travelers** - Great for self-discovery\n👫 **Couples** - Romantic packages available\n👨‍👩‍👧‍👦 **Families** - Family-friendly activities\n👥 **Large groups** - Special group rates (10+)\n🏢 **Corporate groups** - Team-building experiences\n\nHow many people? Group discounts available! 🎟️"
    },
    requirements: {
      default: "📋 **Requirements for touring Egypt:**\n\n🛂 **Visa**\n• Most nationalities need a tourist visa\n• Can be obtained on arrival or online\n• Tourist visa is valid for 30 days\n\n📕 **Passport**\n• Valid for at least 6 months\n• Should have blank pages\n\n💉 **Health**\n• Check current vaccination requirements\n• Malaria precautions in some areas\n• Travel insurance recommended\n\n💰 **Currency & Money**\n• Egyptian Pound (EGP)\n• USD widely accepted\n• ATMs available in cities\n\n👕 **Dress Code**\n• Modest clothing for religious sites\n• Comfortable shoes for walking\n• Light, breathable fabrics\n\nNeed more details? 🤔"
    },
    contact: {
      default: "📞 **Get in touch with our team:**\n\n📧 **Email** - support@egyptourtours.com\n📱 **Phone** - +20 100 123 4567 (WhatsApp available)\n💬 **Live Chat** - Available 24/7 on website\n📍 **Office** - Cairo, Egypt\n⏰ **Hours** - 9 AM - 9 PM (Cairo Time)\n🗓️ **Days** - Saturday to Thursday\n\nWe're here to help! 😊"
    }
  },

  // Detect user intent from message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    let detectedIntents = [];

    Object.entries(this.keywordMap).forEach(([intent, config]) => {
      if (config.keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedIntents.push(config.category);
      }
    });

    return detectedIntents;
  },

  // Get response based on intents
  getResponse(message) {
    const intents = this.detectIntent(message);
    const lowerMessage = message.toLowerCase();

    // Greeting
    if (/^(hello|hi|hey|greetings|hola|salaam|peace)\b/i.test(message)) {
      return "👋 Hello there! Welcome to our tour booking service! 🌟\n\nI'm your personal travel assistant. I can help you with:\n✈️ Finding perfect tour packages\n🗺️ Learning about Egypt's destinations\n💳 Answering all your booking questions\n🎒 Travel requirements & preparation\n📞 Connecting with our customer support\n\nWhat would you like to explore today? 🏜️";
    }

    // Gratitude
    if (/thank|thanks|appreciate|grateful/i.test(message)) {
      return "😊 You're very welcome! That's what I'm here for! 🌟\n\nFeeling ready to book? Or would you like to explore more options? I'm here to help! 🎒";
    }

    // Help request
    if (/^help|assist|support|what can you do/i.test(message)) {
      return "🆘 I'm here to help! Here's what I can assist with:\n\n1️⃣ **Explore Destinations** - Ask about Egypt's amazing places\n2️⃣ **Browse Activities** - Discover experiences\n3️⃣ **Booking Information** - How to book & payment\n4️⃣ **Travel Requirements** - Documents & preparation\n5️⃣ **Group Packages** - Special rates for large groups\n6️⃣ **Contact Information** - Reach our team\n7️⃣ **Price Information** - Package costs & discounts\n\nWhat interests you most? 🤝";
    }

    // Price queries
    if (/price|cost|budget|how much|expensive|affordable|discount/i.test(message)) {
      return "💰 Our packages are designed for every budget!\n\n🏷️ **Budget Tours** - $399-$599 (3 days, basic)\n⭐ **Standard Packages** - $799-$1,299 (5 days, comfortable)\n✨ **Premium Tours** - $1,500-$2,500 (7 days, luxury)\n👑 **VIP Experiences** - $2,500+ (Fully customized)\n\n📦 **What's Included**:\n✅ Accommodation (3-5 stars)\n✅ Professional English-speaking guide\n✅ Transport & meals\n✅ Entry fees to attractions\n✅ 24/7 customer support\n✅ Travel insurance option\n\n💝 **Special Offers**:\n🎁 Group discounts (10+ people)\n📅 Early booking discounts\n👨‍👩‍👧‍👦 Family packages\n\nWant details on a specific package? 🎫";
    }

    // Primary intent-based responses
    if (intents.includes('destinations')) {
      return this.responses.destinations.default;
    }
    if (intents.includes('booking')) {
      return this.responses.booking.default;
    }
    if (intents.includes('activities')) {
      return this.responses.activities.default;
    }
    if (intents.includes('dates')) {
      return this.responses.dates.default;
    }
    if (intents.includes('group')) {
      return this.responses.group.default;
    }
    if (intents.includes('requirements')) {
      return this.responses.requirements.default;
    }
    if (intents.includes('contact')) {
      return this.responses.contact.default;
    }

    // Default fallback response
    return "That's a great question! 😊\n\nYou can ask me about:\n🌍 **Popular destinations** - Cairo, Luxor, Aswan, Alexandria\n🎯 **Activities & experiences** - What to do and see\n📅 **Booking & dates** - Availability and schedules\n👥 **Group sizes** - Rates for different group sizes\n📋 **Requirements** - Travel documents needed\n💬 **Contact us** - Reach our support team\n💰 **Pricing** - Package costs and discounts\n\nFeel free to ask anything! How else can I help? 🚀";
  },

  // Check if response needs real API (future integration)
  shouldUseAPI(intent) {
    return ['booking', 'prices'].includes(intent);
  }
};

export default chatbotService;
