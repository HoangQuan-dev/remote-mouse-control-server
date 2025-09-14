# Remote Mouse Control Server 🖱️

A cross-platform Node.js server that allows you to control your computer's mouse and keyboard from your mobile device via WebSocket connection.

## ✨ Features

- **Cross-Platform Support**: Works on Windows, macOS, and Linux
- **Real-time Control**: Mouse movement, clicking, scrolling, and keyboard input
- **QR Code Connection**: Easy mobile device pairing via QR code
- **Web Interface**: Built-in web interface for connection management
- **Optimized Performance**: Batched mouse movements for smooth operation
- **Secure Local Network**: Operates within your local network only

## 🖥️ Platform Support

### Windows
- **Requirements**: PowerShell (built-in on Windows 10/11)
- **Features**: Full mouse and keyboard control via PowerShell and Win32 APIs
- **Tested**: Windows 10, Windows 11

### macOS
- **Requirements**: Python3 + Quartz framework (built-in macOS)
- **Installation**: 
  - Python3: `brew install python3` (if not already installed)
  - Quartz: `pip3 install pyobjc-framework-Quartz`
- **Features**: Full mouse and keyboard control via AppleScript + Python scripts
- **Scripts**: Uses separate Python scripts for mouse operations (mouse_move.py, mouse_click.py, mouse_position.py)
- **Permissions**: May require accessibility permissions for some features
- **Tested**: macOS Big Sur, Monterey, Ventura

### Linux
- **Requirements**: `xdotool` package
- **Installation**: 
  - Ubuntu/Debian: `sudo apt-get install xdotool`
  - Fedora: `sudo dnf install xdotool`
  - Arch: `sudo pacman -S xdotool`
- **Features**: Full mouse and keyboard control via xdotool
- **Tested**: Ubuntu 20.04+, Fedora 35+

## 🚀 Installation

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install platform-specific dependencies**:
   ```bash
   # macOS
   brew install python3
   pip3 install pyobjc-framework-Quartz
   
   # Linux - Ubuntu/Debian
   sudo apt-get install xdotool
   
   # Linux - Fedora
   sudo dnf install xdotool
   
   # Linux - Arch
   sudo pacman -S xdotool
   ```

## 📱 Usage

1. **Start the server**:
   ```bash
   npm start
   # or
   node server.js
   ```

2. **Open the web interface**:
   - Local: `http://localhost:3000`
   - Network: `http://YOUR_IP:3000`

3. **Connect your mobile device**:
   - Scan the QR code displayed on the web interface
   - Or manually enter the connection details in a compatible mobile app

4. **Control your computer**:
   - Move mouse by dragging on your mobile screen
   - Tap for left click, long press for right click
   - Use pinch gestures for scrolling
   - Type text using your mobile keyboard

## ⚙️ Configuration

Environment variables can be used to customize the server:

```bash
# Mouse sensitivity multiplier (default: 1)
MOUSE_SENSITIVITY=1.5

# Mouse update interval in milliseconds (default: 16 ≈ 60Hz)
MOUSE_APPLY_INTERVAL_MS=16

# Server port (default: 3000)
PORT=3000
```

Example with custom settings:
```bash
MOUSE_SENSITIVITY=2 PORT=8080 node server.js
```

## 🔧 Troubleshooting

### macOS Issues

**Python3 not found**: Install Python3 using Homebrew:
```bash
brew install python3
```

**Quartz module not found**: Install the Quartz framework:
```bash
pip3 install pyobjc-framework-Quartz
```

**Accessibility permissions**: If mouse/keyboard control isn't working:
1. Go to System Preferences → Security & Privacy → Privacy
2. Select "Accessibility" from the left sidebar
3. Click the lock and authenticate
4. Add Terminal or your Node.js application to the list

**Python path issues**: If Python3 isn't found in PATH:
1. Check Python3 location: `which python3`
2. Use full path in AppleScript if needed

### Windows Issues

**PowerShell execution policy**: If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Antivirus software**: Some antivirus programs may block the PowerShell scripts. Add an exception for the application folder.

### Linux Issues

**xdotool not found**: Install xdotool using your distribution's package manager:
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install xdotool

# Fedora
sudo dnf install xdotool

# Arch Linux
sudo pacman -S xdotool
```

**Permission issues**: Make sure your user has permission to create input events (usually automatic for desktop users).

### General Issues

**Connection problems**:
- Ensure your mobile device and computer are on the same network
- Check firewall settings - port 3000 should be accessible
- Try using the IP address instead of hostname

**Performance issues**:
- Adjust `MOUSE_SENSITIVITY` and `MOUSE_APPLY_INTERVAL_MS` environment variables
- Lower sensitivity for more precise control
- Higher interval for better performance on slower machines

## 🛡️ Security

- The server only accepts connections from your local network
- No external internet connection required
- All communication happens via local WebSocket connections
- QR codes contain only local connection information

## 📁 File Structure

```
remote-mouse-control-server/
├── server.js              # Main server file
├── mouseController.js     # Cross-platform mouse/keyboard controller
├── click.ps1             # Windows PowerShell script for mouse clicks
├── public/               # Web interface files
│   └── index.html        # QR code and connection interface
├── package.json          # Node.js dependencies
└── README.md            # This file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for:
- Additional platform support
- Performance improvements
- Bug fixes
- Feature enhancements

## 📄 License

This project is open source. Feel free to use, modify, and distribute as needed.

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Ensure all platform-specific dependencies are installed
4. Open an issue with your platform details and error messages

---

Made with ❤️ for seamless cross-platform remote control
