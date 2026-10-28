import { context } from './context/AppContext.js';
import { AssistantPage } from './pages/AssistantPage.js';
import { AuthFlow } from './components/AuthFlow.js';

class AppBootstrap {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.activeComponent = null;
  }

  init() {
    // Render the initial dashboard layout
    this.render();

    // Subscribe to context changes to update components when states change
    context.subscribe((state) => {
      this.update(state);
    });

    // Handle initial Lucide icons compilation
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  render() {
    this.appContainer.innerHTML = '';
    if (context.state.isAuthenticated) {
      this.activeComponent = new AssistantPage();
      this.appContainer.appendChild(this.activeComponent.render());
    } else {
      this.activeComponent = new AuthFlow(() => {
        this.render();
      });
      this.appContainer.appendChild(this.activeComponent.render());
    }
  }

  update(state) {
    const wasAuthenticated = (this.activeComponent instanceof AssistantPage);
    const isNowAuthenticated = state.isAuthenticated;

    if (wasAuthenticated !== isNowAuthenticated) {
      this.render();
    } else {
      if (this.activeComponent && typeof this.activeComponent.update === 'function') {
        this.activeComponent.update(state);
      }
    }
    
    // Refresh icon vector overlays dynamically after DOM modifications
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

// Instantiate and launch the web client
const appBoot = new AppBootstrap();
document.addEventListener('DOMContentLoaded', () => {
  appBoot.init();
});
