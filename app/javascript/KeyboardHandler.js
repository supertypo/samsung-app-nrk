//	Copyright (C) 2014 Marius Thøring (mthoring@gmail.com)
//
//	This program is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published by
//	the Free Software Foundation, either version 3 of the License, or
//	(at your option) any later version.
//	
//	This program is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//	
//	You should have received a copy of the GNU General Public License
//	along with this program.  If not, see <http://www.gnu.org/licenses/>.
var KeyboardHandler = {
	previousKeyHandler: null
};

KeyboardHandler.register = function() {
	KeyboardHandler.previousKeyHandler = window['app_keyDown'];
	window['app_keyDown'] = KeyboardHandler.keyDown;
};

KeyboardHandler.unRegister = function() {
	window['app_keyDown'] = KeyboardHandler.previousKeyHandler;
};

KeyboardHandler.keyDown = function() {
	switch (event.keyCode) {
	
	case tvKey["KEY_TOOLS"]:
	case tvKey["KEY_CHLIST"]:
	case tvKey["KEY_RETURN"]:
	case tvKey["KEY_PANEL_RETURN"]:
		widgetAPI.blockNavigation(event);
		Keyboard.hide();
		MenuManager.keyLeft();
		break;

	case tvKey["KEY_WHEELUP"]:
	case tvKey["KEY_UP"]:
		Keyboard.keyUp();
		break;
	
	case tvKey["KEY_WHEELDOWN"]:
	case tvKey["KEY_DOWN"]:
		Keyboard.keyDown();
		break;

	case tvKey["KEY_LEFT"]:
	case tvKey["KEY_RW"]:
		Keyboard.keyLeft();
		break;
		
	case tvKey["KEY_RIGHT"]:
	case tvKey["KEY_FF"]:
		Keyboard.keyRight();
		break;

	case tvKey["KEY_ENTER"]:
	case tvKey["KEY_PANEL_ENTER"]:
		Keyboard.keyEnter();
		break;

	default:
		KeyHandler.keyDown();
	}
};