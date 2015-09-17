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
var KeyHandler = {
	ANCHOR_ID: "#anchor",
	log: [-1, -1, -1, -1],
	logCount: 0
};

KeyHandler.register = function() {
	Logger.log("Unregistering volume keys, and enabling Samsung Volume OSD");
	pluginNNavi.SetBannerState(1);
	pluginAPI.unregistKey(tvKey["KEY_VOL_UP"]);
	pluginAPI.unregistKey(tvKey["KEY_VOL_DOWN"]);
	pluginAPI.unregistKey(tvKey["KEY_MUTE"]);
	$(KeyHandler.ANCHOR_ID).focus();
};

KeyHandler.keyDown = function() {
	var kh = KeyHandler;
	var keyCode = event.keyCode;
	kh.log[(kh.logCount % kh.log.length)] = keyCode;
	
	switch (keyCode) {
	case tvKey["KEY_TOOLS"]:
	case tvKey["KEY_CHLIST"]:
	case tvKey["KEY_RETURN"]:
	case tvKey["KEY_PANEL_RETURN"]:
		widgetAPI.blockNavigation(event);
		MenuManager.keyReturn();
		break;
		
	case tvKey["KEY_EXIT"]:
		widgetAPI.blockNavigation(event);
		widgetAPI.sendReturnEvent();
		break;
		
	case tvKey["KEY_WHEELUP"]:
	case tvKey["KEY_UP"]:
		MenuManager.keyUp();
		break;
		
	case tvKey["KEY_WHEELDOWN"]:
	case tvKey["KEY_DOWN"]:
		MenuManager.keyDown();
		break;

	case tvKey["KEY_PANEL_CH_UP"]:
	case tvKey["KEY_CH_UP"]:
		MenuManager.prevChannel();
		break;
		
	case tvKey["KEY_PANEL_CH_DOWN"]:
	case tvKey["KEY_CH_DOWN"]:
		MenuManager.nextChannel();
		break;
		
	case tvKey["KEY_LEFT"]:
		MenuManager.keyLeft();
		break;
		
	case tvKey["KEY_RIGHT"]:
		MenuManager.keyRight();
		break;

	case tvKey["KEY_RW"]:
		MenuManager.playPrevious();
		break;

	case tvKey["KEY_FF"]:
		MenuManager.playNext();
		break;
		
	case tvKey["KEY_ENTER"]:
	case tvKey["KEY_PANEL_ENTER"]:
		MenuManager.keyEnter();
		break;

	case tvKey["KEY_INFO"]:
	case tvKey["KEY_INFOLINK"]:
		Graphics.displayDetailsToggle();
		break;
	
	case tvKey["KEY_0"]:
		Update.check();
		break;
		
    case tvKey["KEY_7"]:
    	if (kh.getKey(-1) == tvKey["KEY_3"]) {
    		// Show/hide log messages on-screen
    		Graphics.displayDebugToggle();
    	} else if (kh.getKey(-1) == tvKey["KEY_4"] && kh.getKey(-2) == tvKey["KEY_1"]) {
    		// Clear memory and disk cache
    		MenuCache.clear();
    		MediaElementCache.clear();
    		ServiceClient.clear();
    		LastSeen.clear();
    		Loader.deleteRuntime();
    	} else if (kh.getKey(-1) == tvKey["KEY_5"] && kh.getKey(-2) == tvKey["KEY_2"]) {
    		// Force save cache to disk
    		MenuCache.save();
    		MediaElementCache.save();
    		LastSeen.save();
    	}
        break;
        
    case tvKey["KEY_RED"]:
    	Subtitle.toggle();
    	break;
    case tvKey["KEY_GREEN"]:
    	Subtitle.timingReset();
    	break;
    case tvKey["KEY_YELLOW"]:
    	Subtitle.timingDecrease();
    	break;
    case tvKey["KEY_BLUE"]:
    	Subtitle.timingIncrease();
        break;
        
    case tvKey["KEY_PLAY"]:
    	Player.playVideo();
    	break;
    	
    case tvKey["KEY_STOP"]:
    	Player.stopVideo();
    	break;
    	
    case tvKey["KEY_PAUSE"]:
        Player.togglePause();
        break;
	};
	kh.logCount++;
};

KeyHandler.getKey = function(index) {
	return KeyHandler.log[(KeyHandler.logCount + index) % KeyHandler.log.length];
};