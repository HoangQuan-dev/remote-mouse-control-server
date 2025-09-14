const PlatformFactory = require('./platforms/platformFactory');

/**
 * Main MouseController class - now clean and maintainable
 * Delegates platform-specific operations to appropriate command modules
 */
class MouseController {
  constructor() {
    this.platformFactory = new PlatformFactory();
    this.commands = this.platformFactory.getCommands();
    
    // Log platform detection
    console.log(`🖥️  Platform detected: ${this.platformFactory.getPlatformName()}`);
    
    // Check platform-specific dependencies
    this.platformFactory.checkDependencies();
  }

  /**
   * Get platform name
   */
  getPlatformName() {
    return this.platformFactory.getPlatformName();
  }

  /**
   * Check if platform is supported
   */
  isSupported() {
    return this.platformFactory.isSupported();
  }

  // ========================================
  // MOUSE OPERATIONS
  // ========================================

  /**
   * Move mouse cursor
   */
  async moveMouse(deltaX, deltaY) {
    try {
      await this.commands.moveMouse(deltaX, deltaY);
    } catch (error) {
      console.error(`Error moving mouse on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Set mouse position absolutely
   */
  async setMousePosition(x, y) {
    try {
      await this.commands.setMousePosition(x, y);
    } catch (error) {
      console.error(`Error setting mouse position on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Mouse click
   */
  async mouseClick(button = 'left') {
    try {
      await this.commands.mouseClick(button);
    } catch (error) {
      console.error(`Error clicking mouse (${button}) on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Mouse drag
   */
  async mouseDrag(startX, startY, endX, endY) {
    try {
      await this.commands.mouseDrag(startX, startY, endX, endY);
    } catch (error) {
      console.error(`Error dragging mouse on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Scroll
   */
  async scroll(deltaX, deltaY) {
    try {
      await this.commands.scroll(deltaX, deltaY);
    } catch (error) {
      console.error(`Error scrolling on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // ========================================
  // KEYBOARD OPERATIONS
  // ========================================

  /**
   * Type text
   */
  async typeText(text) {
    try {
      await this.commands.typeText(text);
    } catch (error) {
      console.error(`Error typing text on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Send key
   */
  async sendKey(key) {
    try {
      // Normalize common special keys to improve cross-client compatibility
      const normalized = String(key).toLowerCase();
      const aliases = { 'esc': 'escape', 'return': 'enter' };
      const finalKey = aliases[normalized] || normalized;
      
      await this.commands.sendKey(finalKey);
    } catch (error) {
      console.error(`Error sending key (${key}) on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // ========================================
  // MEDIA CONTROLS
  // ========================================

  /**
   * Play/Pause media
   */
  async playPause() {
    try {
      await this.commands.playPause();
    } catch (error) {
      console.error(`Error toggling play/pause on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Volume Up
   */
  async volumeUp() {
    try {
      await this.commands.volumeUp();
    } catch (error) {
      console.error(`Error increasing volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Volume Down
   */
  async volumeDown() {
    try {
      await this.commands.volumeDown();
    } catch (error) {
      console.error(`Error decreasing volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Volume Mute/Unmute
   */
  async volumeMute() {
    try {
      await this.commands.volumeMute();
    } catch (error) {
      console.error(`Error muting volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Next Track
   */
  async nextTrack() {
    try {
      await this.commands.nextTrack();
    } catch (error) {
      console.error(`Error skipping to next track on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  /**
   * Previous Track
   */
  async previousTrack() {
    try {
      await this.commands.previousTrack();
    } catch (error) {
      console.error(`Error skipping to previous track on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get current volume level (macOS only)
   */
  async getCurrentVolume() {
    if (this.commands.getCurrentVolume) {
      return await this.commands.getCurrentVolume();
    }
    return null;
  }

  /**
   * Check if volume is muted (macOS only)
   */
  async isVolumeMuted() {
    if (this.commands.isVolumeMuted) {
      return await this.commands.isVolumeMuted();
    }
    return false;
  }

  /**
   * Get platform-specific key codes (for backward compatibility)
   */
  getMacKeyCode(key) {
    const keyMap = {
      'enter': 36,
      'escape': 53,
      'tab': 48,
      'backspace': 51,
      'delete': 117,
      'space': 49,
      'up': 126,
      'down': 125,
      'left': 123,
      'right': 124,
    };
    return keyMap[key.toLowerCase()] || key;
  }
}

module.exports = MouseController;