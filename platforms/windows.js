import { exec } from 'child_process';

/**
 * Windows-specific command implementations
 */
class WindowsCommands {
  constructor() {
    this.platform = 'win32';
  }

  /**
   * Execute PowerShell command
   */
  async executeCommand(psCommand) {
    return new Promise((resolve, reject) => {
      exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Execute PowerShell script file
   */
  async executeScript(scriptPath, args = '') {
    return new Promise((resolve, reject) => {
      exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}" ${args}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Move mouse cursor
   */
  async moveMouse(deltaX, deltaY) {
    const command = `Add-Type -AssemblyName System.Windows.Forms; $p=[System.Windows.Forms.Cursor]::Position; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($($p.X + ${deltaX}), $($p.Y + ${deltaY}))`;
    return this.executeCommand(command);
  }

  /**
   * Set absolute mouse position
   */
  async setMousePosition(x, y) {
    const command = `
      Add-Type -AssemblyName System.Windows.Forms;
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y});
    `;
    return this.executeCommand(command);
  }

  /**
   * Mouse click using PowerShell script
   */
  async mouseClick(button = 'left') {
    const path = require('path');
    const scriptPath = path.join(__dirname, 'windows', 'scripts', 'click.ps1');
    return this.executeScript(scriptPath, `-Button "${button}"`);
  }

  /**
   * Mouse drag
   */
  async mouseDrag(startX, startY, endX, endY) {
    const command = `
      Add-Type -AssemblyName System.Windows.Forms;
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, IntPtr dwExtraInfo); }';
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${startX}, ${startY});
      [Win32]::mouse_event(0x02, 0, 0, 0, [IntPtr]::Zero);
      [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${endX}, ${endY});
      [Win32]::mouse_event(0x04, 0, 0, 0, [IntPtr]::Zero);
    `;
    return this.executeCommand(command);
  }

  /**
   * Scroll
   */
  async scroll(deltaX, deltaY) {
    const scrollDirection = deltaY > 0 ? 120 : -120;
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, IntPtr dwExtraInfo); }';
      [Win32]::mouse_event(0x800, 0, 0, ${Math.abs(scrollDirection)}, [IntPtr]::Zero);
    `;
    return this.executeCommand(command);
  }

  /**
   * Type text
   */
  async typeText(text) {
    const escapedText = text.replace(/"/g, '""');
    const command = `
      Add-Type -AssemblyName System.Windows.Forms;
      [System.Windows.Forms.SendKeys]::SendWait("${escapedText}");
    `;
    return this.executeCommand(command);
  }

  /**
   * Send key
   */
  async sendKey(key) {
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
    const command = `
      Add-Type -AssemblyName System.Windows.Forms;
      [System.Windows.Forms.SendKeys]::SendWait("${windowsKey}");
    `;
    return this.executeCommand(command);
  }

  /**
   * Media controls
   */
  async playPause() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xB3, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_PLAY_PAUSE
      [Win32]::keybd_event(0xB3, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }

  async volumeUp() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xAF, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_UP
      [Win32]::keybd_event(0xAF, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }

  async volumeDown() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xAE, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_DOWN
      [Win32]::keybd_event(0xAE, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }

  async volumeMute() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xAD, 0, 0, [UIntPtr]::Zero);  # VK_VOLUME_MUTE
      [Win32]::keybd_event(0xAD, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }

  async nextTrack() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xB0, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_NEXT_TRACK
      [Win32]::keybd_event(0xB0, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }

  async previousTrack() {
    const command = `
      Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class Win32 { [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo); }';
      [Win32]::keybd_event(0xB1, 0, 0, [UIntPtr]::Zero);  # VK_MEDIA_PREV_TRACK
      [Win32]::keybd_event(0xB1, 0, 2, [UIntPtr]::Zero);  # KEYEVENTF_KEYUP
    `;
    return this.executeCommand(command);
  }
}

export default WindowsCommands;
