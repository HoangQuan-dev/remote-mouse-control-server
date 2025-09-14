#!/usr/bin/env python3
import Quartz
import time
import sys

def click_mouse(button='left'):
    """Click mouse button at current position"""
    try:
        # Get current mouse position
        current_pos = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        
        if button == 'right':
            # Right click
            ev_down = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventRightMouseDown, current_pos, Quartz.kCGMouseButtonRight)
            ev_up = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventRightMouseUp, current_pos, Quartz.kCGMouseButtonRight)
        else:
            # Left click
            ev_down = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, current_pos, Quartz.kCGMouseButtonLeft)
            ev_up = Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, current_pos, Quartz.kCGMouseButtonLeft)
        
        # Post mouse down event
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev_down)
        
        # Small delay
        time.sleep(0.05)
        
        # Post mouse up event
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, ev_up)
        
        return True
    except Exception as e:
        print(f"Error clicking mouse: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    button = sys.argv[1] if len(sys.argv) > 1 else 'left'
    success = click_mouse(button)
    sys.exit(0 if success else 1)
