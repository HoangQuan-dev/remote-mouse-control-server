#!/usr/bin/env python3
import Quartz
import sys

def move_mouse(delta_x, delta_y):
    """Move mouse cursor by delta_x, delta_y pixels"""
    try:
        # Get current mouse position
        current_pos = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        new_x = current_pos.x + delta_x
        new_y = current_pos.y + delta_y
        
        # Move mouse to new position
        Quartz.CGWarpMouseCursorPosition((new_x, new_y))
        return True
    except Exception as e:
        print(f"Error moving mouse: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 mouse_move.py <delta_x> <delta_y>", file=sys.stderr)
        sys.exit(1)
    
    delta_x = int(sys.argv[1])
    delta_y = int(sys.argv[2])
    
    success = move_mouse(delta_x, delta_y)
    sys.exit(0 if success else 1)
