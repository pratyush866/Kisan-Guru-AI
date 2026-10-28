import { context } from '../context/AppContext.js';
import { TranslationUtils } from '../utils/translator.js';
import { UseHistory } from '../hooks/useHistory.js';
import { ExporterUtils } from '../utils/exporter.js';
import { CategoryModel } from '../models/CategoryModel.js';
import { UseSpeech } from '../hooks/useSpeech.js';

export class ChatBox {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'flex flex-col h-[calc(100vh-12rem)] glass-panel rounded-2xl overflow-hidden transition-all duration-300';
  }

  render() {
    const state = context.state;
    const lang = state.language;
    const activeChat = state.chats.find(c => c.id === state.activeChatId);

    // Initial Empty State View (AI Categories Grid)
    if (!activeChat) {
      this.container.innerHTML = `
        <div class="flex-1 flex flex-col items-center justify-center p-8 select-none animate-fade-in overflow-y-auto max-h-full">
          <div class="p-4 bg-brand-50 dark:bg-gray-800/60 rounded-3xl text-brand-500 dark:text-green-400 mb-3 animate-bounce">
            <i data-lucide="bot" class="w-12 h-12"></i>
          </div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-1.5 text-center">
            ${TranslationUtils.translate('welcomeTitle', lang)}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-center">
            Select an agricultural category below to begin or type your question directly in the search bar.
          </p>
          
          <!-- Premium Category Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-w-4xl w-full mx-auto pb-4">
            ${CategoryModel.getAll().map(cat => {
              const translatedLabel = TranslationUtils.translate(cat.id, lang);
              return `
                <button class="category-card-action p-4 glass-card rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 dark:border-gray-800/60" data-cat-id="${cat.id}">
                  <div class="p-2.5 rounded-xl ${cat.color} mb-2.5 flex items-center justify-center">
                    <i data-lucide="${cat.icon}" class="w-5 h-5"></i>
                  </div>
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-300 leading-tight">
                    ${translatedLabel}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
      // Trigger dynamic Lucide icon render
      if (window.lucide) {
        window.lucide.createIcons();
      }
      this.bindEvents();
      return this.container;
    }

    // Dialogue List View
    this.container.innerHTML = `
      <!-- Messages Panel -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6" id="chat-messages-viewport">
        ${activeChat.messages.map(msg => this.renderMessageBubble(msg, lang)).join('')}
        
        <!-- Loading Prompt State -->
        ${state.isGenerating ? `
          <div class="flex items-start space-x-3 animate-pulse">
            <div class="p-2 bg-brand-500 text-white rounded-lg">
              <i data-lucide="bot" class="w-4 h-4"></i>
            </div>
            <div class="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm max-w-lg">
              <div class="flex space-x-2">
                <div class="w-2 h-2 bg-brand-500 dark:bg-green-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-brand-500 dark:bg-green-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div class="w-2 h-2 bg-brand-500 dark:bg-green-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.scrollViewportToBottom();
    this.bindEvents();
    return this.container;
  }

  renderMessageBubble(msg, lang) {
    const isUser = msg.sender === 'user';
    const isFav = context.isFavorite(msg.id);

    if (isUser) {
      return `
        <div class="flex items-end justify-end space-x-3 animate-fade-in">
          <div class="p-3.5 bg-brand-500 text-white font-semibold rounded-2xl rounded-br-none shadow-sm max-w-md text-sm">
            ${msg.text}
          </div>
          <div class="p-2 bg-brand-100 dark:bg-gray-800 text-brand-700 dark:text-gray-300 rounded-xl">
            <i data-lucide="user" class="w-4 h-4"></i>
          </div>
        </div>
      `;
    }

    // AI Responses contain Structured Diagnostic Cards
    const data = msg.data || {};
    return `
      <div class="flex items-start space-x-3 animate-fade-in-up">
        <div class="p-2 bg-brand-500 text-white rounded-xl">
          <i data-lucide="bot" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 max-w-3xl space-y-4">
          
          <!-- Core Description Bubble -->
          <div class="p-4 bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700/50 shadow-sm">
            
            <!-- Diagnosis Structure Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Problem Block -->
              <div class="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                <span class="text-xs font-bold text-red-700 dark:text-red-400 flex items-center mb-1">
                  <i data-lucide="alert-circle" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('problem', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.problem}</p>
              </div>

              <!-- Reason Block -->
              <div class="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                <span class="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center mb-1">
                  <i data-lucide="help-circle" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('reason', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.reason}</p>
              </div>

              <!-- Solution Block -->
              <div class="p-3 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20 rounded-xl md:col-span-2">
                <span class="text-xs font-bold text-green-700 dark:text-green-400 flex items-center mb-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('solution', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.solution}</p>
              </div>

              <!-- Prevention Block -->
              <div class="p-3 bg-sky-50/50 dark:bg-sky-950/10 border border-sky-100 dark:border-sky-900/20 rounded-xl md:col-span-2">
                <span class="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center mb-1">
                  <i data-lucide="shield" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('prevention', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.prevention}</p>
              </div>

              <!-- Cost Estimation -->
              <div class="p-3 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100 dark:border-violet-900/20 rounded-xl">
                <span class="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center mb-1">
                  <i data-lucide="indian-rupee" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('costEst', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.cost}</p>
              </div>

              <!-- Expected Results -->
              <div class="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
                <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center mb-1">
                  <i data-lucide="trending-up" class="w-3.5 h-3.5 mr-1.5"></i>
                  ${TranslationUtils.translate('expResult', lang)}
                </span>
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed">${data.expectedResult}</p>
              </div>

            </div>

            <!-- Expert Tips & Safety warnings footer columns -->
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="text-xs">
                <span class="font-bold text-brand-600 dark:text-green-400 flex items-center mb-1">
                  <i data-lucide="lightbulb" class="w-3.5 h-3.5 mr-1"></i>
                  ${TranslationUtils.translate('expertTip', lang)}:
                </span>
                <span class="text-gray-500 dark:text-gray-400">${data.expertTip}</span>
              </div>
              <div class="text-xs">
                <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center mb-1">
                  <i data-lucide="alert-triangle" class="w-3.5 h-3.5 mr-1"></i>
                  ${TranslationUtils.translate('safetyWarn', lang)}:
                </span>
                <span class="text-gray-500 dark:text-gray-400">${data.warning}</span>
              </div>
            </div>

          </div>

          <!-- Utility Interactions -->
          <div class="flex items-center space-x-3 text-xs pl-2 text-gray-400">
            <!-- Favorite button -->
            <button class="btn-fav-toggle hover:text-brand-500 flex items-center space-x-1" data-msg-id="${msg.id}">
              <i data-lucide="star" class="w-4 h-4 ${isFav ? 'fill-amber-400 stroke-amber-400' : ''}"></i>
              <span>${TranslationUtils.translate('favorites', lang)}</span>
            </button>
            <span>•</span>
            <!-- Speak button -->
            <button class="btn-msg-speak hover:text-brand-500 flex items-center space-x-1" data-msg-id="${msg.id}">
              <i data-lucide="${state.voiceStatus === 'speaking' ? 'volume-x' : 'volume-2'}" class="w-4 h-4"></i>
              <span>${state.voiceStatus === 'speaking' ? 'Stop' : 'Speak'}</span>
            </button>
            <span>•</span>
            <!-- Download details button -->
            <button class="btn-msg-export hover:text-brand-500 flex items-center space-x-1" data-msg-id="${msg.id}">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>${TranslationUtils.translate('exportBtn', lang)}</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }

  bindEvents() {
    // 1. Welcome category cards trigger
    const catCards = this.container.querySelectorAll('.category-card-action');
    catCards.forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.getAttribute('data-cat-id');
        const defaultQueries = {
          crop: {
            english: "Best crop management practices for wheat sowing.",
            hindi: "गेहूं बोने के लिए फसल प्रबंधन के सर्वोत्तम तरीके।",
            hinglish: "Wheat bone ke liye best crop management tareeqe.",
            bhojpuri: "गेहूं बोवे खातिर फसल प्रबंधन के सबसे नीमन तरीका।",
            awadhi: "गेहूं बोवै बरे फसल प्रबंधन के सबसे बढ़िया तरीका।"
          },
          disease: {
            english: "How to identify and treat early blight in tomatoes?",
            hindi: "टमाटर में अगेती झुलसा रोग की पहचान और उपचार कैसे करें?",
            hinglish: "Tomato me early blight disease kaise pehchanein aur thik karein?",
            bhojpuri: "टमाटर में अगेती झुलसा रोग के पहचान आ इलाज कइसे करीं?",
            awadhi: "टमाटर मा झुलसा रोग के पहिचान अउर इलाज कइसे कीन जाइ?"
          },
          pest: {
            english: "How to control fall armyworm in maize organically?",
            hindi: "मक्का में फॉल आर्मीवॉर्म को जैविक रूप से कैसे नियंत्रित करें?",
            hinglish: "Makka me fall armyworm ko organically kaise control karein?",
            bhojpuri: "मक्का में फॉल आर्मीवॉर्म के जैविक रूप से कइसे रोकीं?",
            awadhi: "मक्का मा फॉल आर्मीवॉर्म का जैविक तरीका से कइसे रोके?"
          },
          fertilizer: {
            english: "Best fertilizer schedule for paddy crop.",
            hindi: "धान की फसल के लिए सर्वोत्तम उर्वरक अनुसूची क्या है?",
            hinglish: "Dhan ki fasal ke liye best fertilizer schedule kya hai?",
            bhojpuri: "धान के खेती खातिर सबसे नीमन खाद के कार्यक्रम का बा?",
            awadhi: "धान बरे सबसे बढ़िया खाद के नियम का अहै?"
          },
          irrigation: {
            english: "Optimal water schedule for drip irrigation in potatoes.",
            hindi: "आलू में टपक सिंचाई के लिए इष्टतम जल अनुसूची क्या है?",
            hinglish: "Aloo me drip irrigation ke liye best paani schedule kya hai?",
            bhojpuri: "आलू में ड्रिप सिंचाई खातिर पानी के सही समय का बा?",
            awadhi: "आलू मा टपक सिंचाई बरे पानी के सही नियम का अहै?"
          },
          weather: {
            english: "Advisory for heavy rain prediction during harvest season.",
            hindi: "कटाई के मौसम में भारी बारिश की भविष्यवाणी के लिए कृषि सलाह क्या है?",
            hinglish: "Harvesting time par bhaari baarish ke forecast ke liye advice.",
            bhojpuri: "कटनी के समय भारी बारिस के अनुमान पर का सलाह बा?",
            awadhi: "कटाई के समइया भारी पानी बरसे के अनुमान पर का सलाह अहै?"
          },
          schemes: {
            english: "How to apply for PM-KUSUM solar pump subsidy?",
            hindi: "पीएम-कुसुम सोलर पंप सब्सिडी के लिए आवेदन कैसे करें?",
            hinglish: "PM-KUSUM solar pump subsidy ke liye apply kaise karein?",
            bhojpuri: "पीएम-कुसुम सोलर पंप सब्सिडी खातिर कइसे फॉर्म भरीं?",
            awadhi: "पीएम-कुसुम सोलर पंप सब्सिडी बरे कइसे अर्जी दीह जाय?"
          },
          market: {
            english: "Latest mandi prices and market highlights for potato.",
            hindi: "आलू के लिए नवीनतम मंडी कीमतें और बाजार की मुख्य बातें क्या हैं?",
            hinglish: "Aloo ke liye latest mandi bhav aur market highlights.",
            bhojpuri: "आलू के मंडी के ताजा भाव आ बाजार के हाल का बा?",
            awadhi: "आलू कर मंडी भाव अउर बाजार के हाल का अहै?"
          },
          organic: {
            english: "How to prepare Neemastra bio-pesticide at home?",
            hindi: "घर पर नीमास्त्र जैविक कीटनाशक कैसे तैयार करें?",
            hinglish: "Ghar par Neemastra bio-pest control kaise banayein?",
            bhojpuri: "घर पर नीमास्त्र जैविक दवाई कइसे तैयार करीं?",
            awadhi: "घर मा नीमास्त्र जैविक दवाई कइसे बनावा जाय?"
          },
          modern: {
            english: "How to use sensors and drones for precision agriculture?",
            hindi: "सटीक कृषि के लिए सेंसर और ड्रोन का उपयोग कैसे करें?",
            hinglish: "Modern kheti me sensors aur drones ka use kaise karein?",
            bhojpuri: "सटीक खेती खातिर सेंसर आ ड्रोन के इस्तेमाल कइसे होई?",
            awadhi: "खेती मा सेंसर अउर ड्रोन कर प्रयोग कइसे कीन जाइ?"
          },
          equipment: {
            english: "Best tractor implements for clayey soil plowing.",
            hindi: "चिकनी मिट्टी की जुताई के लिए सर्वोत्तम ट्रैक्टर उपकरण क्या हैं?",
            hinglish: "Mitti ke plowing ke liye best tractor implements kaun se hain?",
            bhojpuri: "चिकनी माटी के जोताई खातिर सबसे नीमन ट्रैक्टर के औजार का बा?",
            awadhi: "चिपचिपी माटी जोतै बरे सबसे नीमन ट्रैक्टर औजार का अहै?"
          },
          livestock: {
            english: "Standard feeding schedule for high-yield dairy cows.",
            hindi: "अधिक उपज देने वाली दुधारू गायों के लिए मानक आहार अनुसूची क्या है?",
            hinglish: "High-yield dairy cows ke liye standard chara feeding schedule.",
            bhojpuri: "बेसी दूध देवे वाली गाय खातिर दाना-पानी के सही नियम का बा?",
            awadhi: "ढेर दूध देवे वाली गइया बरे चारा-पानी कर सही नियम का अहै?"
          },
          financial: {
            english: "How to manage production budget for 2 acres of rice.",
            hindi: "2 एकड़ धान के लिए उत्पादन बजट का प्रबंधन कैसे करें?",
            hinglish: "2 acre dhan ki kheti ke liye budget kaise manage karein?",
            bhojpuri: "2 एकड़ धान खातिर खर्चा के बजट कइसे तय करीं?",
            awadhi: "2 एकड़ धान बरे खर्चा-पानी कर budget कइसे बनावा जाय?"
          },
          insurance: {
            english: "Details of PM Fasal Bima Yojana crop insurance.",
            hindi: "प्रधानमंत्री फसल बीमा योजना (PMFBY) के विवरण क्या हैं?",
            hinglish: "PM Fasal Bima Yojana crop insurance ki details kya hain?",
            bhojpuri: "प्रधानमंत्री फसल बीमा योजना के पूरा जानकारी का बा?",
            awadhi: "प्रधानमंतरी फसल बीमा योजना कर पूरी जानकारी का अहै?"
          }
        };

        const activeLang = context.state.language;
        const queryText = defaultQueries[catId]?.[activeLang] || defaultQueries[catId]?.english || "";
        
        const inputField = document.getElementById('search-input-field');
        const submitBtn = document.getElementById('btn-submit-search');
        if (inputField) {
          inputField.value = queryText;
          context.setSearchQuery(queryText);
          inputField.focus();
          
          inputField.classList.add('ring-2', 'ring-brand-500');
          setTimeout(() => {
            inputField.classList.remove('ring-2', 'ring-brand-500');
          }, 600);

          if (submitBtn) {
            submitBtn.click();
          }
        }
      });
    });

    const messagesViewport = this.container.querySelector('#chat-messages-viewport');
    if (!messagesViewport) return;

    // Toggle favorite states
    const favBtns = this.container.querySelectorAll('.btn-fav-toggle');
    favBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const activeChat = context.state.chats.find(c => c.id === context.state.activeChatId);
        const msg = activeChat?.messages.find(m => m.id === msgId);
        if (msg) {
          UseHistory.toggleFavoriteResponse(msg.id, msg.text, msg.data, activeChat.category);
        }
      });
    });

    // Single message export
    const exportBtns = this.container.querySelectorAll('.btn-msg-export');
    exportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const activeChat = context.state.chats.find(c => c.id === context.state.activeChatId);
        const msg = activeChat?.messages.find(m => m.id === msgId);
        if (msg) {
          // Trigger instant JSON export of diagnostic advice card
          const mockChat = {
            id: msgId,
            title: activeChat.title,
            category: activeChat.category,
            createdAt: msg.timestamp,
            messages: [
              { sender: 'user', text: activeChat.messages.find(m => m.sender === 'user')?.text || 'Query', timestamp: msg.timestamp },
              msg
            ]
          };
          ExporterUtils.exportToTXT(mockChat);
        }
      });
    });

    // Speak response audio
    const speakBtns = this.container.querySelectorAll('.btn-msg-speak');
    speakBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const activeChat = context.state.chats.find(c => c.id === context.state.activeChatId);
        const msg = activeChat?.messages.find(m => m.id === msgId);
        if (msg) {
          if (context.state.voiceStatus === 'speaking') {
            UseSpeech.stopSpeaking();
            context.setVoiceStatus('idle');
          } else {
            // Build text payload from structural AdviceDetail keys
            const d = msg.data || {};
            const readText = `
              ${d.problem || msg.text}. 
              ${d.reason ? 'Reason: ' + d.reason : ''}. 
              ${d.solution ? 'Solution: ' + d.solution : ''}. 
              ${d.expertTip ? 'Expert Tip: ' + d.expertTip : ''}.
            `;
            
            context.setVoiceStatus('speaking');
            UseSpeech.speakResponse(
              readText,
              context.state.language,
              () => context.setVoiceStatus('speaking'),
              () => context.setVoiceStatus('idle'),
              (err) => {
                alert(`Voice synthesis error: ${err}`);
                context.setVoiceStatus('idle');
              }
            );
          }
        }
      });
    });
  }

  scrollViewportToBottom() {
    setTimeout(() => {
      const messagesViewport = this.container.querySelector('#chat-messages-viewport');
      if (messagesViewport) {
        messagesViewport.scrollTop = messagesViewport.scrollHeight;
      }
    }, 50);
  }
}
