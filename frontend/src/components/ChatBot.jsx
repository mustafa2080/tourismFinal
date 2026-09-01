import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Loader, MessageSquare } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import '../styles/chatbot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "👋 Hello! Welcome to our tour booking service. I'm here to help you find the perfect tour package, answer questions about destinations, and assist with your booking. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContentRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const tourKeywords = {
    destinations: ['egypt', 'cairo', 'luxor', 'aswan', 'alexandria', 'giza', 'sinai', 'destination', 'place', 'where'],
    booking: ['book', 'reserve', 'booking', 'package', 'tour', 'price', 'cost', 'payment', 'reserve', 'when'],
    activities: ['activity', 'activities', 'what to do', 'do', 'things', 'experience', 'adventure', 'explore'],
    dates: ['date', 'when', 'available', 'schedule', 'duration', 'days', 'night', 'months'],
    group: ['group', 'people', 'person', 'family', 'friend', 'how many'],
    requirements: ['required', 'need', 'document', 'visa', 'passport', 'requirement'],
    contact: ['contact', 'call', 'email', 'phone', 'help', 'support', 'customer service']
  };

  const getBotResponse = (userMessage) => {
    const messageLower = userMessage.toLowerCase();
    
    // Detect user intent
    const isDest = tourKeywords.destinations.some(k => messageLower.includes(k));
    const isBooking = tourKeywords.booking.some(k => messageLower.includes(k));
    const isActivities = tourKeywords.activities.some(k => messageLower.includes(k));
    const isDates = tourKeywords.dates.some(k => messageLower.includes(k));
    const isGroup = tourKeywords.group.some(k => messageLower.includes(k));
    const isReq = tourKeywords.requirements.some(k => messageLower.includes(k));
    const isContact = tourKeywords.contact.some(k => messageLower.includes(k));

    // Dynamic responses based on intent
    if (isDest && !isBooking) {
      return "🌍 We offer amazing tours to Egypt's most iconic destinations! Here are our popular ones:\n\n📍 **Cairo** - Ancient pyramids, museums, and vibrant culture\n📍 **Luxor** - Temples, tombs, and the Nile\n📍 **Aswan** - Scenic Nile cruises and Nubian culture\n📍 **Alexandria** - Mediterranean beaches and ancient history\n📍 **Sinai** - Desert adventures and adventure activities\n\nWould you like to know more about any of these destinations? 😊";
    }

    if (isBooking && !isDates && !isGroup) {
      return "📅 To help you book the perfect tour:\n\n1️⃣ **Choose your destination** - Where would you like to go?\n2️⃣ **Select dates** - When are you planning to travel?\n3️⃣ **Group size** - How many people will be joining?\n4️⃣ **Choose package** - View our available packages\n5️⃣ **Complete booking** - Secure payment and confirmation\n\nWould you like help with any of these steps? 🎫";
    }

    if (isActivities) {
      return "🎯 Our tours include fantastic activities:\n\n🏛️ **Cultural & Historical** - Museum tours, temple visits, historical sites\n🐪 **Adventure** - Desert safaris, quad biking, hot air balloon rides\n🚤 **Water Activities** - Nile cruises, snorkeling, felucca sailing\n🏕️ **Outdoor** - Hiking, camping, wildlife spotting\n🍽️ **Culinary** - Local cuisine tastings, traditional cooking classes\n🎭 **Entertainment** - Traditional shows, local markets, night tours\n\nWhat activities interest you most? ✨";
    }

    if (isDates) {
      return "📆 Perfect! When are you thinking of traveling?\n\n✅ **Best time to visit Egypt:** October - April (cool weather)\n⏰ **Typical tour duration:** 3-7 days\n🌡️ **Summer (May-September):** Hot, but fewer crowds and better prices\n\nOnce you have specific dates in mind, I can help you find the best available packages! 📝";
    }

    if (isGroup) {
      return "👥 Group size helps us customize your experience!\n\n👤 **Solo travelers** - Perfect for self-discovery and making new friends\n👫 **Couples** - Romantic destinations and private experiences\n👨‍👩‍👧 **Families** - Family-friendly activities and comfortable pacing\n👥 **Large groups** - Special group rates and dedicated guide\n\nHow many people will be traveling? Let me find the best package for you! 🎟️";
    }

    if (isReq) {
      return "📋 **Requirements for touring Egypt:**\n\n🛂 **Visa** - Most nationalities need a tourist visa\n📕 **Passport** - Valid for 6+ months\n💉 **Vaccinations** - Check current health requirements\n💰 **Currency** - Egyptian Pound (EGP), USD accepted\n🏥 **Travel Insurance** - Highly recommended\n👕 **Dress Code** - Modest clothing recommended for cultural sites\n🌞 **Sun Protection** - Sunscreen and hat essential\n\nNeed more specific information? 🤔";
    }

    if (isContact) {
      return "📞 **Get in touch with our team:**\n\n📧 **Email:** support@tourbooking.com\n📱 **Phone:** +20 100 123 4567\n💬 **Live Chat:** Available 24/7 (click the support icon)\n📍 **Office:** Cairo, Egypt\n⏰ **Hours:** 9 AM - 9 PM (Cairo Time)\n\nYou can also continue chatting with me! I'm here to help anytime. 😊";
    }

    // Greeting and general responses
    if (messageLower.includes('hello') || messageLower.includes('hi') || messageLower.includes('hey')) {
      return "👋 Hello there! Welcome to our tour booking service! 🌟\n\nI'm your travel assistant. I can help you with:\n✈️ Finding perfect tour packages\n🗺️ Learning about destinations\n💳 Answering booking questions\n📞 Connecting you with our team\n\nWhat would you like to explore? 🏜️";
    }

    if (messageLower.includes('thanks') || messageLower.includes('thank')) {
      return "😊 You're very welcome! That's what I'm here for! 🌟\n\nIs there anything else I can help you with? Feel free to ask about destinations, activities, bookings, or anything travel-related! 🎒";
    }

    if (messageLower.includes('help')) {
      return "🆘 I'm here to help! Here's what I can assist with:\n\n1️⃣ **Explore Destinations** - Ask about Egypt's amazing places\n2️⃣ **Browse Activities** - Discover what to do\n3️⃣ **Booking Info** - Learn how to book\n4️⃣ **Group Packages** - Info for large groups\n5️⃣ **Requirements** - Travel requirements & documents\n6️⃣ **Contact Us** - Get our team's contact info\n7️⃣ **Browse Packages** - Direct link to our tours\n\nWhat would you like to know? 🤝";
    }

    if (messageLower.includes('package') || messageLower.includes('price') || messageLower.includes('cost')) {
      return "💰 Our packages are designed for every budget!\n\n🏷️ **Budget Tours** - $399-599 (3 days)\n⭐ **Standard Packages** - $799-1,299 (5 days)\n✨ **Premium Tours** - $1,500-2,500 (7 days)\n👑 **Luxury Experiences** - $2,500+ (Customized)\n\nEach package includes:\n✅ Accommodation\n✅ Professional guide\n✅ Transport & meals\n✅ Entry fees\n✅ 24/7 support\n\nWould you like to view our full package list? 🎫";
    }

    // Default helpful response
    return "That's a great question! 😊\n\nYou can ask me about:\n🌍 **Destinations** - Where to visit in Egypt\n🎯 **Activities** - Things to do and experiences\n📅 **Booking** - How to reserve your tour\n👥 **Groups** - Rates for groups\n📋 **Requirements** - Travel documents needed\n💬 **Contact** - Reach our team\n\nOr feel free to browse our packages directly! How else can I assist you? 🚀";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate bot typing delay for natural feel
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        text: getBotResponse(input),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      setIsTyping(false);
    }, 800);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: "👋 Chat cleared! Hello! Welcome to our tour booking service. How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="chatbot-container">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/201001234567"
        className="whatsapp-button"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        aria-label="Open WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </a>

      {/* Chat Widget Button */}
      <button
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="message-icon-wrapper">
            <MessageCircle size={24} />
            <span className="badge">💬</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-content">
            <h3>Travel Assistant</h3>
            <p className="status">Always here to help</p>
          </div>
          <button
            className="close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" ref={chatContentRef}>
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`message ${msg.type}-message`}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              <div className="message-content">
                <div className="message-bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="message bot-message" style={{ animation: 'slideIn 0.3s ease-out' }}>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chatbot-input-area">
          <form onSubmit={handleSendMessage} className="chatbot-form">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask about tours, destinations, bookings..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              maxLength={500}
            />
            <button
              type="submit"
              className={`send-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
          <button className="clear-btn" onClick={clearChat} title="Clear chat">
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
