const { exec } = require('child_process');
const path = require('path');

/**
 * macOS-specific command implementations
 */
class MacOSCommands {
  constructor() {
    this.platform = 'darwin';
  }

  /**
   * Execute AppleScript command
   */
  async executeCommand(osascript) {
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${osascript}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Execute Python script
   */
  async executePythonScript(scriptName, ...args) {
    const scriptPath = path.join(__dirname, 'macos', 'scripts', scriptName);
    const command = `python3 '${scriptPath}' ${args.join(' ')}`;
    return this.executeCommand(`do shell script "${command}"`);
  }

  /**
   * Move mouse cursor using Python script
   */
  async moveMouse(deltaX, deltaY) {
    return this.executePythonScript('mouse_move.py', deltaX, deltaY);
  }

  /**
   * Set absolute mouse position using Python script
   */
  async setMousePosition(x, y) {
    return this.executePythonScript('mouse_position.py', x, y);
  }

  /**
   * Mouse click using Python script
   */
  async mouseClick(button = 'left') {
    return this.executePythonScript('mouse_click.py', button);
  }

  /**
   * Mouse drag
   */
  async mouseDrag(startX, startY, endX, endY) {
    const command = `
      tell application "System Events"
        set the position of the mouse to {${startX}, ${startY}}
        mouse down at (get the position of the mouse)
        set the position of the mouse to {${endX}, ${endY}}
        mouse up at (get the position of the mouse)
      end tell
    `;
    return this.executeCommand(command);
  }

  /**
   * Scroll
   */
  async scroll(deltaX, deltaY) {
    const command = `tell application "System Events" to scroll {${deltaX}, ${deltaY}}`;
    return this.executeCommand(command);
  }

  /**
   * Type text
   */
  async typeText(text) {
    const command = `tell application "System Events" to keystroke "${text}"`;
    return this.executeCommand(command);
  }

  /**
   * Send key
   */
  async sendKey(key) {
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
    const keyCode = keyMap[key.toLowerCase()] || key;
    const command = `tell application "System Events" to key code ${keyCode}`;
    return this.executeCommand(command);
  }

  /**
   * Media controls
   */
  async playPause() {
    // First try the 'k' key (YouTube/video player standard)
    try {
      await this.executeCommand(`tell application "System Events" to keystroke "k"`);
    } catch (kError) {
      // Fallback to space key if 'k' doesn't work
      console.log('Trying space key as fallback...');
      await this.executeCommand(`tell application "System Events" to keystroke " "`);
    }
  }

  async volumeUp() {
    // Use AppleScript to increase volume by 6.25% (one standard step)
    return this.executeCommand(`set volume output volume (output volume of (get volume settings) + 6.25)`);
  }

  async volumeDown() {
    // Use AppleScript to decrease volume by 6.25% (one standard step)
    return this.executeCommand(`set volume output volume (output volume of (get volume settings) - 6.25)`);
  }

  async volumeMute() {
    // Use AppleScript to toggle mute/unmute intelligently
    const isMutedResult = await this.executeCommand(`output muted of (get volume settings)`);
    const isMuted = isMutedResult.trim() === 'true';
    
    if (isMuted) {
      // Currently muted, so unmute
      await this.executeCommand(`set volume without output muted`);
      console.log('Volume unmuted');
    } else {
      // Currently unmuted, so mute
      await this.executeCommand(`set volume with output muted`);
      console.log('Volume muted');
    }
  }

  async nextTrack() {
    // Use correct macOS media key - Next Track (F9 key)
    return this.executeCommand(`tell application "System Events" to key code 101`);
  }

  async previousTrack() {
    // Use correct macOS media key - Previous Track (F7 key)
    return this.executeCommand(`tell application "System Events" to key code 98`);
  }

  /**
   * Get current volume level (macOS only)
   */
  async getCurrentVolume() {
    try {
      const volume = await this.executeCommand(`output volume of (get volume settings)`);
      return parseFloat(volume.trim());
    } catch (error) {
      console.error('Error getting current volume:', error.message);
      return null;
    }
  }

  /**
   * Check if volume is muted
   */
  async isVolumeMuted() {
    try {
      const isMuted = await this.executeCommand(`output muted of (get volume settings)`);
      return isMuted.trim() === 'true';
    } catch (error) {
      console.error('Error checking mute status:', error.message);
      return false;
    }
  }
}

module.exports = MacOSCommands;
