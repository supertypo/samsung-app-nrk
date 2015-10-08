//	Copyright (C) 2015 Marius Thøring (mthoring@gmail.com)
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
var Logger = {
	MAX_LOG_EVENTS : 36,
	MIN_SPLIT_LENGTH: 100,
	TEXT_CHECK_ID: "#textCheck",
	DEBUG_ID: "#debug",
	logEvents : []
};

var proxiedAlert = alert;
alert = function(message) {
	Logger.log(message);
};

window.onerror = function(msg, url, line) {
	Logger.log(msg);
};

Logger.log = function(message) {
	if(!message) {
		proxiedAlert(message);
		return;
	}
	message = message.toString();
	proxiedAlert(message);
	messageArray = message.split("\n");
	for (var i=0; i<messageArray.length; i++) {
		Logger.splitAndAdd(messageArray[i]);
	}
};

Logger.splitAndAdd = function(message) {
	var element = $(Logger.TEXT_CHECK_ID);
	if(message.length > Logger.MIN_SPLIT_LENGTH) {
		for (var i=Logger.MIN_SPLIT_LENGTH; i<message.length; i++) {
			element.html(message.substring(0, i));
			if(element.width() > $(Logger.DEBUG_ID).width()) {
				Logger.addToLog(message.substring(0, i-1));
				Logger.splitAndAdd(message.substring(i-1, message.length));
				return;
			}
		}
	}
	Logger.addToLog(message);
};

Logger.addToLog = function(message) {
	if (Logger.logEvents.length == Logger.MAX_LOG_EVENTS) {
		Logger.logEvents.shift();
	}
	Logger.logEvents[Logger.logEvents.length] = message;
};
