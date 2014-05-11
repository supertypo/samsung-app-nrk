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
var MenuConst = {
		ID_ROOT : "#root",
		ID_DIREKTE : "#direkte",
		ID_A_AA : "#a_aa",
		ID_SHOWS : "#shows",
		ID_SEASONS : "#seasons",
		ID_EPISODES : "#episodes",
};

/** @constructor */
function Menu(id, parentMenu) {
	this.id = id;
	this.parentMenu = parentMenu;
	this.listbox = null;
	this.clickable = false;
	this.width = 0;
	this.names = null;
	this.urls = null;
	
	this.setItems = function(names, urls) {
		Logger.log("Retrieved items for: " + this.id);
		this.clear();
		this.names = names;
		this.urls = urls;
		this.createListBox();
		this.width = $(this.id).outerWidth(true);
		Background.change(this);
	};
	
	this.createListBox = function() {
		this.listbox = new MenuListbox(this.id, this.names);
	};
	
	this.clear = function() {
		$(this.id).empty();
	};
	
	this.show = function() {
		$(this.id).show();
	};
	
	this.hide = function() {
		$(this.id).hide();
	};
	
	this.prev = function() {
		this.listbox.prev();
	};
	
	this.next = function() {
		this.listbox.next();
	};
	
	this.getSelectedName = function() {
		return this.names[this.getIndex()];
	};
	
	this.getSelectedUrl = function() {
		if(this.urls != null) {
			return this.urls[this.getIndex()];
		} else {
			return null;
		}
	};
	
	this.getUrl = function(index) {
		return this.urls[index];
	};
	
	this.getIndex = function() {
		return this.listbox.getIndex();
	};
	
	this.returnMenu = function(id) {
		var name = this.parentMenu.getSelectedName() + "_" + this.getSelectedName();
		var cachedMenu = MenuCache.getMenu(name);
		if (cachedMenu != null && cachedMenu.clickable && name != "Søk_Søk") {
			Logger.log("Using cached menu \"" + name + "\" for " + id);
			cachedMenu.show();
			cachedMenu.listbox.draw();
			Background.change(cachedMenu);
			return cachedMenu;
		} else {
			Logger.log("Creating new menu \"" + name + "\" for " + id);
			var newMenu = new Menu(id, this);
			MenuCache.cacheMenu(name, newMenu);
			return newMenu;
		}
	};
	
	this.getSelectedValue = function() {
		var selectedName = this.getSelectedName();
		switch (this.id) {
		case MenuConst.ID_ROOT:
			switch (selectedName) {
			case "Direkte":
				return this.returnMenu(MenuConst.ID_DIREKTE, this);
			case "Radio":
				return this.returnMenu(MenuConst.ID_DIREKTE, this);
			case "Nytt":
				return this.returnMenu(MenuConst.ID_SHOWS, this);
			case "Populært":
				return this.returnMenu(MenuConst.ID_SHOWS, this);
			case "Anbefalt":
				return this.returnMenu(MenuConst.ID_SHOWS, this);
			case "Søk":
				return this.returnMenu(MenuConst.ID_SHOWS, this);
			default:
				return this.returnMenu(MenuConst.ID_A_AA, this);
			}
			break;
		case MenuConst.ID_DIREKTE:
			return {"name": selectedName, "url": this.getSelectedUrl()};
			break;
		case MenuConst.ID_A_AA:
			return this.returnMenu(MenuConst.ID_SHOWS, this);
			break;
		case MenuConst.ID_SHOWS:
			if ((this.parentMenu.id == MenuConst.ID_ROOT && this.parentMenu.getSelectedName() != "Søk") 
					|| this.getSelectedUrl().indexOf("/serie/") != 0) {
				return {"name": selectedName, "url": this.getSelectedUrl()};
			} else {
				return this.returnMenu(MenuConst.ID_SEASONS, this);
			}
			break;
		case MenuConst.ID_SEASONS:
			return this.returnMenu(MenuConst.ID_EPISODES, this);
			break;
		case MenuConst.ID_EPISODES:
			return {"name": selectedName, "url": this.getSelectedUrl()};
			break;
		default:
			Logger.log("Menu.getSelectedValue(): Unknown menu");
		}
	};
	
	this.show();
	this.listbox = new MenuListbox(this.id, ["Laster..."]);

	switch(this.id) {
	case MenuConst.ID_ROOT:
		this.clickable = true;
		this.setItems(["Direkte", "Radio", "Nytt", "Populært", "Anbefalt", "Barn", "Dokumentarer", "Filmer/serier", "Nyheter", "Sport", "Alle", "Søk"]);
		break;
	case MenuConst.ID_DIREKTE:
		this.clickable = true;
		if(this.parentMenu.getSelectedName() == "Radio") {
			this.setItems(
					["NRK P1", "NRK P2", "NRK P3", "NRK P13"], 
					["http://radio.nrk.no/direkte/p1_oslo_akershus", "http://radio.nrk.no/direkte/p2", 
					 "http://radio.nrk.no/direkte/p3", "http://radio.nrk.no/direkte/p13"]);
		} else {
			this.setItems(
					["NRK1", "NRK2", "NRK3/Super"], 
					["/direkte/nrk1", "/direkte/nrk2", "/direkte/nrk3"]);
		}
		break;
	case MenuConst.ID_A_AA:
		this.clickable = true;
		this.setItems(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N",
		              "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "Æ", "Ø", "Å", "-"]);
		break;
	case MenuConst.ID_SHOWS:
		var letter = this.parentMenu.getSelectedName();
		if(letter == "-") {
			letter = "0-9";
		}
		switch (this.parentMenu.parentMenu.getSelectedName()) {
			case "Nytt":
				WebParser.getNewShows(this);
				break;
			case "Populært":
				WebParser.getPopularShows(this);
				break;
			case "Anbefalt":
				WebParser.getRecommendedShows(this);
				break;
			case "Alle":
				WebParser.getAllShowsForLetter(letter, this);
				break;
			case "Barn":
				WebParser.getChildrenShowsForLetter(letter, this);
				break;
			case "Dokumentarer":
				WebParser.getDocumentaryShowsForLetter(letter, this);
				break;
			case "Filmer/serier":
				WebParser.getMoviesAndSeriesForLetter(letter, this);
				break;
			case "Nyheter":
				WebParser.getNewsForLetter(letter, this);
				break;
			case "Sport":
				WebParser.getSportShowsForLetter(letter, this);
				break;
			case "Søk":
				Keyboard.search(this);
				break;
			default:
				Logger.log("Menu: Unknown option: " + this.parentMenu.parentMenu.getSelectedName());
		}
		break;
	case MenuConst.ID_SEASONS:
		WebParser.getSeasonsForShow(this.parentMenu.getSelectedUrl(), this);
		break;
	case MenuConst.ID_EPISODES:
		WebParser.getEpisodesForSeason(this.parentMenu.getSelectedUrl(), this);
		break;
	default:
		Logger.log("Menu.constructor(): Unknown menu");
	}
};

