#!/usr/bin/env python3
import Quartz
import time
import sys
import unicodedata

def type_text(text):
    """Type text with proper Unicode support for Vietnamese and other languages"""
    try:
        # Normalize the text to handle Vietnamese diacritics properly
        normalized_text = unicodedata.normalize('NFC', text)
        
        # Convert to UTF-8 bytes and back to ensure proper encoding
        text_bytes = normalized_text.encode('utf-8')
        clean_text = text_bytes.decode('utf-8')
        
        # Type each character individually for better compatibility
        for char in clean_text:
            # Create a key event for the character
            key_code = ord(char.upper()) if char.isalpha() else 0
            
            # For special characters and Vietnamese diacritics, use Unicode input
            if key_code > 127 or not char.isprintable():
                # Use Unicode input method
                unicode_input(char)
            else:
                # Use regular key input for ASCII characters
                regular_key_input(char)
            
            # Small delay between characters
            time.sleep(0.01)
        
        return True
    except Exception as e:
        print(f"Error typing text: {e}", file=sys.stderr)
        return False

def unicode_input(char):
    """Handle Unicode characters (Vietnamese diacritics, etc.)"""
    try:
        # Get current mouse position for context
        current_pos = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        
        # Create a key event with the Unicode character
        # Use kCGEventKeyDown and kCGEventKeyUp for proper character input
        key_down = Quartz.CGEventCreateKeyboardEvent(None, 0, True)
        key_up = Quartz.CGEventCreateKeyboardEvent(None, 0, False)
        
        # Set the Unicode character
        Quartz.CGEventKeyboardSetUnicodeString(key_down, 1, char)
        Quartz.CGEventKeyboardSetUnicodeString(key_up, 1, char)
        
        # Post the events
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_down)
        time.sleep(0.01)
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_up)
        
    except Exception as e:
        print(f"Error with Unicode input: {e}", file=sys.stderr)

def regular_key_input(char):
    """Handle regular ASCII characters"""
    try:
        # Get current mouse position for context
        current_pos = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        
        # Create key down and up events
        key_down = Quartz.CGEventCreateKeyboardEvent(None, 0, True)
        key_up = Quartz.CGEventCreateKeyboardEvent(None, 0, False)
        
        # Set the character
        Quartz.CGEventKeyboardSetUnicodeString(key_down, 1, char)
        Quartz.CGEventKeyboardSetUnicodeString(key_up, 1, char)
        
        # Post the events
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_down)
        time.sleep(0.01)
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, key_up)
        
    except Exception as e:
        print(f"Error with regular key input: {e}", file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 type_text.py <text>", file=sys.stderr)
        sys.exit(1)
    
    # Get text from command line arguments
    text = ' '.join(sys.argv[1:])
    
    success = type_text(text)
    sys.exit(0 if success else 1)
