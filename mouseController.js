const { spawn, exec } = require('child_process');
const os = require('os');

class MouseController {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform === 'linux';
  }

  // Move mouse cursor
  async moveMouse(deltaX, deltaY) {
    try {
      if (this.isWindows) {
        const command = `Add-Type -AssemblyName System.Windows.Forms; $p=[System.Windows.Forms.Cursor]::Position; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($($p.X + ${deltaX}), $($p.Y + ${deltaY}))`;
        await this.executeWindowsCommand(command);
      } else if (this.isMac) {
        await this.executeMacCommand(`tell application "System Events" to set the position of the mouse to {${deltaX}, ${deltaY}}`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool mousemove_relative -- ${deltaX} ${deltaY}`);
      }
    } catch (error) {
      console.error('Error moving mouse:', error);
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
        await this.executeMacCommand(`tell application "System Events" to set the position of the mouse to {${x}, ${y}}`);
      } else if (this.isLinux) {
        await this.executeLinuxCommand(`xdotool mousemove ${x} ${y}`);
      }
    } catch (error) {
      console.error('Error setting mouse position:', error);
    }
  }

  // Mouse click
  async mouseClick(button = 'left') {
    try {
      if (this.isWindows) {
        // Use the PowerShell script for clicking
        await this.executeWindowsScript(button);
      } else if (this.isMac) {
        const clickButton = button === 'right' ? 'right' : 'left';
        await this.executeMacCommand(`tell application "System Events" to click at (get the position of the mouse) using {${clickButton} click}`);
      } else if (this.isLinux) {
        const clickButton = button === 'right' ? '3' : '1';
        await this.executeLinuxCommand(`xdotool click ${clickButton}`);
      }
    } catch (error) {
      console.error('Error clicking mouse:', error);
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
      }
    } catch (error) {
      console.error('Error dragging mouse:', error);
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
      }
    } catch (error) {
      console.error('Error scrolling:', error);
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
      }
    } catch (error) {
      console.error('Error typing text:', error);
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
      }
    } catch (error) {
      console.error('Error sending key:', error);
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
          reject(error);
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