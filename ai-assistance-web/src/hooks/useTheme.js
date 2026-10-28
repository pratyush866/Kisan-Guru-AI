import { context } from '../context/AppContext.js';

export class UseTheme {
  /**
   * Toggles the active context theme between light and dark modes.
   */
  static toggle() {
    const currentTheme = context.state.theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    context.setTheme(nextTheme);
  }

  static getTheme() {
    return context.state.theme;
  }
}
