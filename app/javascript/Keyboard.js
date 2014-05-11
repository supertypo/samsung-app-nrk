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
var Keyboard = {
	KEYBOARD_ID : "#keyboard",
	INPUT_ID : "#keyboard input",
	ROWS : 4,
	COLUMNS : 11,
	menu : null,
	selectedButton : null,
	keyboard: null,
	input: null,
	x : 6,
	y : 3
};

Keyboard.search = function(menu) {
	Keyboard.show();
	Keyboard.menu = menu;
	Keyboard.menu.hide();
};

Keyboard.show = function() {
	Keyboard.keyboard = $(Keyboard.KEYBOARD_ID);
	Keyboard.input = $(Keyboard.INPUT_ID);
	Keyboard.updateKeyboard();
	Keyboard.keyboard.show();
	KeyboardHandler.register();
};

Keyboard.hide = function() {
	KeyboardHandler.unRegister();
	Keyboard.keyboard.hide();
};

Keyboard.onOk = function() {
	Keyboard.hide();
	if(Keyboard.input.val() != "") {
		Keyboard.menu.show();
		Search.search(Keyboard.input.val(), Keyboard.menu);
	} else {
		MenuManager.keyLeft();
	}
};

Keyboard.keyEnter = function() {
	var currentValue = Keyboard.input.val(); 
	if (Keyboard.selectedButton.html() == "OK") {
		Keyboard.onOk();
	} else if (Keyboard.selectedButton.html() == "&nbsp;") {
		Keyboard.input.val(currentValue + " ");
	} else if (Keyboard.selectedButton.html() == "&lt;--") {
		Keyboard.input.val(currentValue.substring(0, currentValue.length - 1));
	} else {
		Keyboard.input.val(currentValue + Keyboard.selectedButton.html());
	}
};

Keyboard.keyUp = function() {
	Keyboard.y = Keyboard.y - 1;
	if (Keyboard.y <= 0) {
		Keyboard.y = Keyboard.ROWS;
	}
	Keyboard.updateKeyboard();
};

Keyboard.keyDown = function() {
	Keyboard.y = Keyboard.y + 1;
	if (Keyboard.y > Keyboard.ROWS) {
		Keyboard.y = 1;
	}
	Keyboard.updateKeyboard();
};

Keyboard.keyLeft = function() {
	Keyboard.x = Keyboard.x - 1;
	if (Keyboard.x <= 0) {
		Keyboard.x = Keyboard.COLUMNS;
	}
	Keyboard.updateKeyboard();
};

Keyboard.keyRight = function() {
	Keyboard.x = Keyboard.x + 1;
	if (Keyboard.x > Keyboard.COLUMNS) {
		Keyboard.x = 1;
	}
	Keyboard.updateKeyboard();
};

Keyboard.updateKeyboard = function() {
	if (Keyboard.selectedButton) {
		Keyboard.selectedButton.attr("id", "");
	}
	var row = Keyboard.keyboard.find(".row:nth-child(" + (Keyboard.y + 2) + ")");
	Keyboard.selectedButton = $(row).find("span:nth-child(" + Keyboard.x + ")");
	if (Keyboard.y == Keyboard.ROWS && Keyboard.x == Keyboard.COLUMNS) {
		Keyboard.selectedButton = $(row).find("span:nth-child(" + (Keyboard.COLUMNS - 1) + ")");
	}
	Keyboard.selectedButton.attr("id", "selected");
};
