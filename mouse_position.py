#!/usr/bin/env python3
import Quartz
import sys

def set_mouse_position(x, y):
    """Set mouse cursor to absolute position x, y"""
    try:
        # Move mouse to absolute position
        Quartz.CGWarpMouseCursorPosition((x, y))
        return True
    except Exception as e:
        print(f"Error setting mouse position: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 mouse_position.py <x> <y>", file=sys.stderr)
        sys.exit(1)
    
    x = int(sys.argv[1])
    y = int(sys.argv[2])
    
    success = set_mouse_position(x, y)
    sys.exit(0 if success else 1)
