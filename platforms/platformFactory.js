const os = require('os');
const WindowsCommands = require('./windows').default;
const MacOSCommands = require('./macos');

/**
 * Platform factory to create appropriate command implementations
 */
class PlatformFactory {
  constructor() {
    this.platform = os.platform();
    this.commands = this.createPlatformCommands();
  }

  /**
   * Create platform-specific command implementation
   */
  createPlatformCommands() {
    switch (this.platform) {
      case 'win32':
        return new WindowsCommands();
      case 'darwin':
        return new MacOSCommands();
      default:
        throw new Error(`Unsupported platform: ${this.platform}. Only Windows and macOS are supported.`);
    }
  }

  /**
   * Get platform name
   */
  getPlatformName() {
    switch (this.platform) {
      case 'win32': return 'Windows';
      case 'darwin': return 'macOS';
      default: return `Unknown (${this.platform})`;
    }
  }

  /**
   * Check if current platform is supported
   */
  isSupported() {
    return ['win32', 'darwin'].includes(this.platform);
  }

  /**
   * Get platform-specific commands instance
   */
  getCommands() {
    return this.commands;
  }

  /**
   * Check platform dependencies
   */
  async checkDependencies() {
    try {
      if (this.platform === 'darwin') {
        // Check if Python3 and Quartz are available
        await this.commands.executeCommand('do shell script "python3 -c \\"import Quartz; print(\\\\\\"Quartz available\\\\\\")\\"');
        console.log('✅ macOS dependencies: Python3 + Quartz found');
      } else if (this.platform === 'win32') {
        // Check if PowerShell is available
        await this.commands.executeCommand('Get-Host');
        console.log('✅ Windows dependencies: PowerShell available');
      }
    } catch (error) {
      console.warn(`⚠️  Platform dependency check failed: ${error.message}`);
      this.printDependencyInstructions();
    }
  }

  /**
   * Print dependency installation instructions
   */
  printDependencyInstructions() {
    switch (this.platform) {
      case 'darwin':
        console.warn('📋 Install Python3: brew install python3');
        console.warn('📋 Install Quartz: pip3 install pyobjc-framework-Quartz');
        break;
      case 'win32':
        console.warn('📋 PowerShell should be available by default on Windows');
        break;
    }
  }
}

module.exports = PlatformFactory;
