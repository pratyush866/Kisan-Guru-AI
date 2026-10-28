import { context } from '../context/AppContext.js';
import { Navbar } from '../components/Navbar.js';
import { TranslationUtils } from '../utils/translator.js';
import { Dashboard } from '../components/Dashboard.js';
import { Search } from '../components/Search.js';
import { ChatBox } from '../components/ChatBox.js';
import { UseSpeech } from '../hooks/useSpeech.js';
import { HistoryPanel } from '../components/HistoryPanel.js';
import { AIService } from '../services/AIService.js';
import { CropRecommendationPage } from '../components/CropRecommendationPage.js';
import { CropDiseaseScanner } from '../components/CropDiseaseScanner.js';
import { PestManagementPage } from '../components/PestManagementPage.js';
import { SmartIrrigationPage } from '../components/SmartIrrigationPage.js';
import { BottomNavigation } from '../components/BottomNavigation.js';
import { MandiPricesPage } from '../components/MandiPricesPage.js';
import { Marketplace } from '../components/Marketplace.js';
import { CommunityFeed } from '../components/CommunityFeed.js';
import { GovernmentSchemes } from '../components/GovernmentSchemes.js';
import { ExpertConsultation } from '../components/ExpertConsultation.js';
import { ProfileSettings } from '../components/ProfileSettings.js';
import { LearningCenter } from '../components/LearningCenter.js';
import { FarmDashboard } from '../components/FarmDashboard.js';
import { WeatherDetails } from '../components/WeatherDetails.js';

export class AssistantPage {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'flex flex-col min-h-screen';

    // Instantiate sub-components
    this.navbarComponent = new Navbar();
    this.bottomNavComponent = new BottomNavigation();
    
    this.dashboardComponent = new Dashboard((query) => this.handleQuickAsk(query));
    this.farmComponent = new FarmDashboard();
    this.searchComponent = new Search((query) => this.handleQuery(query));
    this.chatBoxComponent = new ChatBox();
    this.historyPanelComponent = new HistoryPanel();
    this.recommendationComponent = new CropRecommendationPage();
    this.diseaseComponent = new CropDiseaseScanner();
    this.pestComponent = new PestManagementPage();
    this.irrigationComponent = new SmartIrrigationPage();
    this.weatherComponent = new WeatherDetails();
    this.mandiComponent = new MandiPricesPage();
    this.marketplaceComponent = new Marketplace();
    this.communityComponent = new CommunityFeed();
    this.schemesComponent = new GovernmentSchemes();
    this.expertComponent = new ExpertConsultation();
    this.profileComponent = new ProfileSettings();
    this.learningComponent = new LearningCenter();
  }

  render() {
    this.container.innerHTML = '';
    
    // Append Navbar
    this.container.appendChild(this.navbarComponent.render());

    // Main layout viewport
    const mainViewport = document.createElement('main');
    mainViewport.className = 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12 lg:pl-64';
    mainViewport.id = 'page-content-viewport';
    
    this.container.appendChild(mainViewport);

    // Initial load view injection
    this.renderActiveTab(mainViewport);

    // Append Bottom Navigation
    this.container.appendChild(this.bottomNavComponent.render());

    return this.container;
  }

  update(state) {
    // 1. Update Navbar to sync active tab highlights
    this.navbarComponent.render();

    // 2. Update Bottom Navigation
    this.bottomNavComponent.render();

    // 3. Synchronize main viewport
    const mainViewport = this.container.querySelector('#page-content-viewport');
    if (mainViewport) {
      this.renderActiveTab(mainViewport);
    }
  }

  renderActiveTab(viewport) {
    const state = context.state;
    viewport.innerHTML = '';

    // Render Offline Warning Banner if connection is dropped
    if (state.isOffline) {
      const offlineBanner = document.createElement('div');
      offlineBanner.className = 'mb-6 p-4 bg-amber-500/20 border border-amber-500 text-amber-800 dark:text-amber-300 rounded-xl text-sm font-semibold flex items-center space-x-3 animate-fade-in';
      offlineBanner.innerHTML = `
        <i data-lucide="wifi-off" class="w-5 h-5 text-amber-600 dark:text-amber-400"></i>
        <span>${TranslationUtils.translate('offlineBanner', state.language)}</span>
      `;
      viewport.appendChild(offlineBanner);
      if (window.lucide) window.lucide.createIcons();
    }

    if (state.activeTab === 'home') {
      // Home Screen Dashboard (Dashboard.js)
      viewport.appendChild(this.dashboardComponent.render());
    } else if (state.activeTab === 'dashboard' || state.activeTab === 'farm') {
      // Farm Dashboard / Operations Ledger
      viewport.appendChild(this.farmComponent.render());
    } else if (state.activeTab === 'recommendation') {
      // Crop Recommendation Workspace View
      viewport.appendChild(this.recommendationComponent.render());
    } else if (state.activeTab === 'disease') {
      // Crop Disease Scanner View
      viewport.appendChild(this.diseaseComponent.render());
    } else if (state.activeTab === 'pest') {
      // Pest Management View
      viewport.appendChild(this.pestComponent.render());
    } else if (state.activeTab === 'irrigation') {
      // Smart Irrigation View
      viewport.appendChild(this.irrigationComponent.render());
    } else if (state.activeTab === 'weather') {
      // Weather Forecast View
      viewport.appendChild(this.weatherComponent.render());
    } else if (state.activeTab === 'mandi') {
      // Mandi Prices View
      viewport.appendChild(this.mandiComponent.render());
    } else if (state.activeTab === 'marketplace') {
      // Marketplace View
      viewport.appendChild(this.marketplaceComponent.render());
    } else if (state.activeTab === 'community') {
      // Community Farmer Chopal View
      viewport.appendChild(this.communityComponent.render());
    } else if (state.activeTab === 'schemes') {
      // Gov Schemes View
      viewport.appendChild(this.schemesComponent.render());
    } else if (state.activeTab === 'expert') {
      // Expert Booking View
      viewport.appendChild(this.expertComponent.render());
    } else if (state.activeTab === 'profile') {
      // Settings / Profile View
      viewport.appendChild(this.profileComponent.render());
    } else if (state.activeTab === 'learning') {
      // Learning Center View
      viewport.appendChild(this.learningComponent.render());
    } else {
      // AI Assistant View
      const assistantContainer = document.createElement('div');
      assistantContainer.className = 'space-y-6';

      // 1. Render Search bar at top
      assistantContainer.appendChild(this.searchComponent.render());

      // 2. Render Dialogue grid (ChatBox & History side-by-side)
      const chatGrid = document.createElement('div');
      chatGrid.className = 'grid grid-cols-1 md:grid-cols-4 gap-6';

      const chatBoxWrapper = document.createElement('div');
      chatBoxWrapper.className = 'md:col-span-3';
      chatBoxWrapper.appendChild(this.chatBoxComponent.render());

      const historyWrapper = document.createElement('div');
      historyWrapper.className = 'md:col-span-1';
      historyWrapper.appendChild(this.historyPanelComponent.render());

      chatGrid.appendChild(chatBoxWrapper);
      chatGrid.appendChild(historyWrapper);

      assistantContainer.appendChild(chatGrid);
      viewport.appendChild(assistantContainer);
    }
  }

  async handleQuery(text) {
    if (!text.trim()) return;
    
    let chatId = context.state.activeChatId;
    
    // Create new session if no active chat
    if (!chatId) {
      chatId = Date.now().toString();
      const newChat = {
        id: chatId,
        title: text.length > 30 ? text.substring(0, 30) + '...' : text,
        category: 'General',
        createdAt: new Date().toISOString(),
        messages: []
      };
      context.addChat(newChat);
    }

    const activeChat = context.state.chats.find(c => c.id === chatId);
    if (!activeChat) return;

    // Add user query message bubble
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...activeChat.messages, userMsg];
    context.updateChatMessages(chatId, updatedMessages);
    
    // Switch on AI typing visual indicator
    context.setGenerating(true);

    try {
      // Build Copilot Context
      const contextPayload = {
        weather: context.state.weatherData ? `${context.state.weatherData.temperature}°C, ${context.state.weatherData.description}` : 'Unknown',
        crop: 'Wheat', // This can be dynamic based on user profile later
        location: context.state.locationName || 'Unknown'
      };

      // Query response generation from AI (async support)
      const aiResponse = await AIService.generateResponse(text, context.state.language, contextPayload);
      
      // Update session category tags based on semantic classification
      activeChat.category = aiResponse.category;
      
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: aiResponse.data.problem,
        data: aiResponse.data,
        timestamp: aiResponse.timestamp
      };

      context.updateChatMessages(chatId, [...updatedMessages, botMsg]);
      
      // Auto speak the response in selected language
      const d = aiResponse.data || {};
      const readText = `
        ${d.problem || ''}. 
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
          console.warn('Auto-speak failed:', err);
          context.setVoiceStatus('idle');
        }
      );
    } catch (error) {
      console.error('Failed to get response:', error);
      
      // Insert fallback error bubble in chat
      const errMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: TranslationUtils.translate('errorGeneratingResponse', context.state.language),
        data: {
          problem: TranslationUtils.translate('serviceConnectionInterrupted', context.state.language),
          reason: TranslationUtils.translate('serviceConnectionReason', context.state.language),
          solution: TranslationUtils.translate('serviceConnectionSolution', context.state.language),
          prevention: TranslationUtils.translate('serviceConnectionPrevention', context.state.language),
          cost: 'N/A',
          expectedResult: TranslationUtils.translate('serviceConnectionExpected', context.state.language),
          expertTip: TranslationUtils.translate('serviceConnectionTip', context.state.language),
          warning: TranslationUtils.translate('serviceConnectionWarning', context.state.language)
        },
        timestamp: new Date().toISOString()
      };
      context.updateChatMessages(chatId, [...updatedMessages, errMsg]);
    } finally {
      context.setGenerating(false);
    }
  }

  handleQuickAsk(query) {
    // Navigate to Assistant tab and post query
    context.setTab('assistant');
    // Clear active chat to force new session for quick ask
    context.setActiveChat(null);
    this.handleQuery(query);
  }
}
