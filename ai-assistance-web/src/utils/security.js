/**
 * Kisan Guru AI Security Utilities
 * Implements input sanitization (XSS mitigation) and synchronous local data encryption.
 */
export class SecurityUtils {
  // Simple key for local data obfuscation/encryption
  static #SECRET_KEY = 'kisan_guru_secured_local_key_2026';

  /**
   * Sanitizes user inputs to prevent Cross-Site Scripting (XSS) injections.
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Synchronously encrypts a JSON-serializable object into an obfuscated/encrypted string.
   */
  static encryptData(data) {
    try {
      const jsonStr = JSON.stringify(data);
      // Perfect Unicode character representation handling
      const utf8Bytes = encodeURIComponent(jsonStr);
      let result = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        const charCode = utf8Bytes.charCodeAt(i);
        const keyChar = this.#SECRET_KEY.charCodeAt(i % this.#SECRET_KEY.length);
        // XOR Cipher operation
        result += String.fromCharCode(charCode ^ keyChar);
      }
      return btoa(result); // Base64 packaging
    } catch (e) {
      console.error('Data encryption failure:', e);
      return null;
    }
  }

  /**
   * Synchronously decrypts an encrypted/obfuscated string back to its original object format.
   */
  static decryptData(encryptedStr) {
    try {
      if (!encryptedStr) return null;
      const rawStr = atob(encryptedStr);
      let decrypted = '';
      for (let i = 0; i < rawStr.length; i++) {
        const charCode = rawStr.charCodeAt(i);
        const keyChar = this.#SECRET_KEY.charCodeAt(i % this.#SECRET_KEY.length);
        // Reverse XOR operation
        decrypted += String.fromCharCode(charCode ^ keyChar);
      }
      const jsonStr = decodeURIComponent(decrypted);
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Data decryption failure:', e);
      return null;
    }
  }
}
