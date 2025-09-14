const { spawn, exec } = require('child_process');
const os = require('os');

class MouseController {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform === 'linux';
    
    // Log platform detection
    console.log(`🖥️  Platform detected: ${this.getPlatformName()}`);
    
    // Check platform-specific dependencies
    this.checkDependencies();
  }
  
  getPlatformName() {
    if (this.isWindows) return 'Windows';
    if (this.isMac) return 'macOS';
    if (this.isLinux) return 'Linux';
    return `Unknown (${this.platform})`;
  }
  
  async checkDependencies() {
    try {
      if (this.isLinux) {
        // Check if xdotool is available
        await this.executeLinuxCommand('which xdotool');
        console.log('✅ Linux dependencies: xdotool found');
      } else if (this.isMac) {
        // Check if Python3 and Quartz are available
        await this.executeMacCommand('do shell script "python3 -c \\"import Quartz; print(\\\\\\"Quartz available\\\\\\")\\"');
        console.log('✅ macOS dependencies: Python3 + Quartz found');
      } else if (this.isWindows) {
        // Check if PowerShell is available
        await this.executeWindowsCommand('Get-Host');
        console.log('✅ Windows dependencies: PowerShell available');
      }
    } catch (error) {
      console.warn(`⚠️  Platform dependency check failed: ${error.message}`);
      if (this.isLinux) {
        console.warn('📋 Install xdotool: sudo apt-get install xdotool (Ubuntu/Debian) or equivalent');
      } else if (this.isMac) {
        console.warn('📋 Install Python3: brew install python3');
        console.warn('📋 Install Quartz: pip3 install pyobjc-framework-Quartz');
      }
    }
  }

  // Move mouse cursor
  async moveMouse(deltaX, deltaY) {
    try {
      if (this.isWindows) {
        const command = `Add-Type -AssemblyName System.Windows.Forms; $p=[System.Windows.Forms.Cursor]::Position; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($($p.X + ${deltaX}), $($p.Y + ${deltaY}))`;
        await this.executeWindowsCommand(command);
      } else if (this.isMac) {
        // Use Python script for mouse movement on macOS
        const scriptPath = require('path').join(__dirname, 'mouse_move.py');
        await this.executeMacCommand(`do shell script "python3 '${scriptPath}' ${deltaX} ${deltaY}"`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool mousemove_relative -- ${deltaX} ${deltaY}`);
      } else {
        throw new Error(`Mouse movement not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error moving mouse on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Set mouse position absolutely
  async setMousePosition(x, y) {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -AssemblyName System.Windows.Forms;
          [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y});
        `);
      } else if (this.isMac) {
        // Use Python script for absolute mouse positioning on macOS
        const scriptPath = require('path').join(__dirname, 'mouse_position.py');
        await this.executeMacCommand(`do shell script "python3 '${scriptPath}' ${x} ${y}"`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool mousemove ${x} ${y}`);
      } else {
        throw new Error(`Setting mouse position not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error setting mouse position on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Mouse click
  async mouseClick(button = 'left') {
    try {
      if (this.isWindows) {
        // Use the PowerShell script for clicking
        await this.executeWindowsScript(button);
      } else if (this.isMac) {
        // Use Python script for mouse clicking on macOS
        const scriptPath = require('path').join(__dirname, 'mouse_click.py');
        await this.executeMacCommand(`do shell script "python3 '${scriptPath}' ${button}"`);
      } else if (this.isLinux) {
        const clickButton = button === 'right' ? '3' : '1';
        await this.executeLinuxCommand(`xdotool click ${clickButton}`);
      } else {
        throw new Error(`Mouse clicking not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error clicking mouse (${button}) on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Mouse drag
  async mouseDrag(startX, startY, endX, endY) {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -AssemblyName System.Windows.Forms;
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, IntPtr dwExtraInfo); }';
          [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${startX}, ${startY});
          [Win32]::mouse_event(0x02, 0, 0, 0, [IntPtr]::Zero);
          [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${endX}, ${endY});
          [Win32]::mouse_event(0x04, 0, 0, 0, [IntPtr]::Zero);
        `);
      } else if (this.isMac) {
        await this.executeMacCommand(`
          tell application "System Events"
            set the position of the mouse to {${startX}, ${startY}}
            mouse down at (get the position of the mouse)
            set the position of the mouse to {${endX}, ${endY}}
            mouse up at (get the position of the mouse)
          end tell
        `);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool mousemove ${startX} ${startY} mousedown 1 mousemove ${endX} ${endY} mouseup 1`);
      } else {
        throw new Error(`Mouse dragging not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error dragging mouse on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Scroll
  async scroll(deltaX, deltaY) {
    try {
      if (this.isWindows) {
        const scrollDirection = deltaY > 0 ? 120 : -120;
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, IntPtr dwExtraInfo); }';
          [Win32]::mouse_event(0x800, 0, 0, ${Math.abs(scrollDirection)}, [IntPtr]::Zero);
        `);
      } else if (this.isMac) {
        await this.executeMacCommand(`tell application "System Events" to scroll {${deltaX}, ${deltaY}}`);
      } else if (this.isLinux) {
        const scrollButton = deltaY > 0 ? '4' : '5';
        await this.executeLinuxCommand(`xdotool click ${scrollButton}`);
      } else {
        throw new Error(`Scrolling not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error scrolling on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Type text
  async typeText(text) {
    try {
      if (this.isWindows) {
        const escapedText = text.replace(/"/g, '""');
        await this.executeWindowsCommand(`
          Add-Type -AssemblyName System.Windows.Forms;
          [System.Windows.Forms.SendKeys]::SendWait("${escapedText}");
        `);
      } else if (this.isMac) {
        await this.executeMacCommand(`tell application "System Events" to keystroke "${text}"`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool type "${text}"`);
      } else {
        throw new Error(`Text typing not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error typing text on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Send key
  async sendKey(key) {
    try {
      if (this.isWindows) {
        const keyMap = {
          'enter': '{ENTER}',
          'escape': '{ESC}',
          'tab': '{TAB}',
          'backspace': '{BACKSPACE}',
          'delete': '{DELETE}',
          'space': ' ',
          'up': '{UP}',
          'down': '{DOWN}',
          'left': '{LEFT}',
          'right': '{RIGHT}',
          'ctrl': '^',
          'alt': '%',
          'shift': '+',
        };
        const windowsKey = keyMap[key.toLowerCase()] || key;
        await this.executeWindowsCommand(`
          Add-Type -AssemblyName System.Windows.Forms;
          [System.Windows.Forms.SendKeys]::SendWait("${windowsKey}");
        `);
      } else if (this.isMac) {
        await this.executeMacCommand(`tell application "System Events" to key code ${this.getMacKeyCode(key)}`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key ${key}`);
      } else {
        throw new Error(`Key sending not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error sending key (${key}) on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Helper methods for executing platform-specific commands
  async executeWindowsCommand(psCommand) {
    return new Promise((resolve, reject) => {
      // Use -NoProfile and -NonInteractive for faster startup and reliability
      exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  // Execute PowerShell script for mouse clicking
  async executeWindowsScript(button) {
    const path = require('path');
    const scriptPath = path.join(__dirname, 'click.ps1');
    return new Promise((resolve, reject) => {
      exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}" -Button "${button}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);kk
        } else {
          resolve(stdout);
        }
      });
    });
  }

  async executeMacCommand(osascript) {
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

  async executeLinuxCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  // Media controls
  async playPause() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xB3, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_PLAY_PAUSE
          [Win32]::keybd_event(0xB3, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // First try the 'k' key (YouTube/video player standard)
        try {
          await this.executeMacCommand(`tell application "System Events" to keystroke "k"`);
        } catch (kError) {
          // Fallback to space key if 'k' doesn't work
          console.log('Trying space key as fallback...');
          await this.executeMacCommand(`tell application "System Events" to keystroke " "`);
        }
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioPlay`);
      } else {
        throw new Error(`Media controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error toggling play/pause on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  async volumeUp() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xAF, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_UP
          [Win32]::keybd_event(0xAF, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // Use AppleScript to increase volume by 6.25% (one standard step)
        await this.executeMacCommand(`set volume output volume (output volume of (get volume settings) + 6.25)`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioRaiseVolume`);
      } else {
        throw new Error(`Volume controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error increasing volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  async volumeDown() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xAE, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_DOWN
          [Win32]::keybd_event(0xAE, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // Use AppleScript to decrease volume by 6.25% (one standard step)
        await this.executeMacCommand(`set volume output volume (output volume of (get volume settings) - 6.25)`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioLowerVolume`);
      } else {
        throw new Error(`Volume controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error decreasing volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  async volumeMute() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xAD, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_MUTE
          [Win32]::keybd_event(0xAD, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // Use AppleScript to toggle mute/unmute intelligently
        const isMutedResult = await this.executeMacCommand(`output muted of (get volume settings)`);
        const isMuted = isMutedResult.trim() === 'true';
        
        if (isMuted) {
          // Currently muted, so unmute
          await this.executeMacCommand(`set volume without output muted`);
          console.log('Volume unmuted');
        } else {
          // Currently unmuted, so mute
          await this.executeMacCommand(`set volume with output muted`);
          console.log('Volume muted');
        }
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioMute`);
      } else {
        throw new Error(`Volume controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error muting volume on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  async nextTrack() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xB0, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_NEXT_TRACK
          [Win32]::keybd_event(0xB0, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // Use correct macOS media key - Next Track (F9 key)  
        await this.executeMacCommand(`tell application "System Events" to key code 101`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioNext`);
      } else {
        throw new Error(`Media controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error skipping to next track on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  async previousTrack() {
    try {
      if (this.isWindows) {
        await this.executeWindowsCommand(`
          Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
          [Win32]::keybd_event(0xB1, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_PREV_TRACK
          [Win32]::keybd_event(0xB1, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
        `);
      } else if (this.isMac) {
        // Use correct macOS media key - Previous Track (F7 key)
        await this.executeMacCommand(`tell application "System Events" to key code 98`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool key XF86AudioPrev`);
      } else {
        throw new Error(`Media controls not supported on platform: ${this.platform}`);
      }
    } catch (error) {
      console.error(`Error skipping to previous track on ${this.getPlatformName()}:`, error.message);
      throw error;
    }
  }

  // Helper method to get current volume level (macOS only)
  async getCurrentVolume() {
    if (this.isMac) {
      try {
        const volume = await this.executeMacCommand(`output volume of (get volume settings)`);
        return parseFloat(volume.trim());
      } catch (error) {
        console.error('Error getting current volume:', error.message);
        return null;
      }
    }
    return null;
  }

  // Mac key codes
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