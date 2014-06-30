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
var MenuManager = {
	MAX_VISIBLE_DEPTH: 1,
	ID_MENU : "#menu",
	MENU_DESCRIPTION : "Hovedmeny",
	SCREEN_SAVER_INTERVAL_SECONDS: 30,
	SCREEN_SAVER_MAX_DISTANCE: 10,
	INFO_TIMEOUT_SECONDS: 30,
	screenSaverCurrentDistance : -1,
	screenSaverCurrentDirection : "right",
	selectedMenu : null,
	playbackMenu : null,
	menuVisible : true,
	currentDepth : 0,
	currentTop : 0,
	currentLeft : 0
};

MenuManager.screenSaver = function() {
	if(MenuManager.screenSaverCurrentDistance >= 0) {
		if(MenuManager.screenSaverCurrentDirection == "right") {
			if(MenuManager.screenSaverCurrentDistance < MenuManager.SCREEN_SAVER_MAX_DISTANCE) {
				MenuManager.screenSaverCurrentDistance++;
				MenuManager.currentTop++;
				MenuManager.currentLeft++;
				$(MenuManager.ID_MENU).css("top", MenuManager.currentTop);
				$(MenuManager.ID_MENU).css("left", MenuManager.currentLeft);
			} else {
				MenuManager.screenSaverCurrentDirection = "left";
			}
		} else {
			if(MenuManager.screenSaverCurrentDistance > 0) {
				MenuManager.screenSaverCurrentDistance--;
				MenuManager.currentTop--;
				MenuManager.currentLeft--;
				$(MenuManager.ID_MENU).css("top", MenuManager.currentTop);
				$(MenuManager.ID_MENU).css("left", MenuManager.currentLeft);
			} else {
				MenuManager.screenSaverCurrentDirection = "right";
			}
		}
	} else {
		MenuManager.screenSaverCurrentDistance = 0;
	}
	setTimeout(MenuManager.screenSaver, MenuManager.SCREEN_SAVER_INTERVAL_SECONDS * 1000);
};

MenuManager.init = function() {
	MenuManager.screenSaver();
	TimeAndDate.showWallClock();
	MenuManager.showMenu();
	MenuManager.selectedMenu = MenuConst.getRootMenu();
	MenuManager.currentTop = $(MenuManager.ID_MENU).offset()["top"];
	MenuManager.currentLeft = $(MenuManager.ID_MENU).offset()["left"];
	Logger.log("Saved " + MenuManager.ID_MENU + " top: " + MenuManager.currentTop + ", left: " + MenuManager.currentLeft);
};

MenuManager.prevChannel = function() {
	if (MenuManager.menuVisible) {
		MenuManager.keyUp();
	}
	MenuManager.showMenu();
};

MenuManager.nextChannel = function() {
	if (MenuManager.menuVisible) {
		MenuManager.keyDown();
	}
	MenuManager.showMenu();
};

MenuManager.keyUp = function() {
	if (MenuManager.menuVisible) {
		MenuManager.selectedMenu.prev();
		MenuManager.hasMoved = true;
	} else {
		Player.jumpForward(600);
	}
};

MenuManager.keyDown = function() {
	if (MenuManager.menuVisible) {
		MenuManager.selectedMenu.next();
		MenuManager.hasMoved = true;
	} else {
		Player.jumpBackward(600);
	}
};

MenuManager.keyLeft = function() {
	if (MenuManager.menuVisible) {
		if (MenuManager.selectedMenu.parentMenu != MenuManager.selectedMenu) {
			MenuManager.selectedMenu.hide();
			MenuManager.selectedMenu = MenuManager.selectedMenu.parentMenu;
			MenuManager.selectedMenu.show();
			MenuManager.moveMenuRight();
			MenuManager.hasMoved = true;
		}
	} else {
		Player.jumpBackward(30);
	}
};

MenuManager.keyRight = function() {
	if (MenuManager.menuVisible) {
		MenuManager.keyEnter();
	} else {
		Player.jumpForward(30);
	}
};

MenuManager.keyEnter = function() {
	if (MenuManager.menuVisible) {
		if (MenuManager.selectedMenu.clickable) {
			MenuManager.selectedMenu.open(function (selectedValue) {
				if (selectedValue) {
					if (selectedValue instanceof Menu) {
						MenuManager.selectedMenu = selectedValue;
						MenuManager.moveMenuLeft();
					} else {
						if (selectedValue.title == Player.getCurrentTitle() && Player.state != Player.STOPPED) {
							MenuManager.keyReturn();
						} else if (selectedValue.mediaUrl) {
							MenuManager.hasMoved = false;
							Player.play(selectedValue);
							Graphics.showDescription(MenuManager.INFO_TIMEOUT_SECONDS);
						} else {
							Logger.log("No mediaUrl supplied: " + selectedValue);
						}
					}
				}
			});
		}
	} else {
		MenuManager.keyReturn();
	}
};

MenuManager.keyReturn = function() {
	if (MenuManager.menuVisible && Player.state != Player.STOPPED) {
		Graphics.showPlayerInfo(Player.getStateDescription());
		MenuManager.hideMenu();
		Main.disableScreenSaver();
	} else {
		Main.enableScreenSaver();
		MenuManager.showMenu();
	}
};

MenuManager.moveMenuLeft = function() {
	MenuManager.currentDepth++;
	if(MenuManager.currentDepth > MenuManager.MAX_VISIBLE_DEPTH) {
		var moveMenu = MenuManager.selectedMenu;
		for(var i=0; i<MenuManager.MAX_VISIBLE_DEPTH + 1; i++) {
			moveMenu = moveMenu.parentMenu;
		}
		MenuManager.currentLeft -= moveMenu.width;
		Logger.log("Moving " + MenuManager.ID_MENU + ", left: " + MenuManager.currentLeft);
		$(MenuManager.ID_MENU).css("left", MenuManager.currentLeft);
	}
};

MenuManager.moveMenuRight = function() {
	MenuManager.currentDepth--;
	if(MenuManager.currentDepth >= MenuManager.MAX_VISIBLE_DEPTH) {
		var moveMenu = MenuManager.selectedMenu;
		for(var i=0; i<MenuManager.MAX_VISIBLE_DEPTH; i++) {
			moveMenu = moveMenu.parentMenu;
		}
		MenuManager.currentLeft += moveMenu.width;
		Logger.log("Moving " + MenuManager.ID_MENU + ", left: " + MenuManager.currentLeft);
		$(MenuManager.ID_MENU).css("left", MenuManager.currentLeft);
	}
};

MenuManager.playbackComplete = function() {
	Player.stopVideo();
	var selectedMenu = MenuManager.selectedMenu;
	if (!MenuManager.hasMoved && selectedMenu.getIndex() > 0 
			&& selectedMenu.parentMenu.getSelectedMediaElement().type == MediaElementType.SEASON) {
		Logger.log("Autoplaying next episode");
		MenuManager.keyUp();
		MenuManager.keyEnter();
	}
};

MenuManager.showMenu = function() {
	$(MenuManager.ID_MENU).show();
	MenuManager.menuVisible = true;
};

MenuManager.hideMenu = function() {
	$(MenuManager.ID_MENU).hide();
	MenuManager.menuVisible = false;
	Graphics.stopEpgUpdate();
};