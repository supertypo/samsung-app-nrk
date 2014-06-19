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
var PlayerEventHandler = {
		MAX_RETRIES : 1,
		MAX_DURATION : 36000,
		retryCount : 0,
		currentSeconds : 0,
		durationSeconds : 0,
		progressSeconds : 0,
		autoJump : false
};

PlayerEventHandler.reset = function() {
	PlayerEventHandler.currentSeconds = 0;
	PlayerEventHandler.durationSeconds = 0;
};

PlayerEventHandler.register = function() {
	PlayerEventHandler.retryCount = 0;
    pluginPlayer.OnConnectionFailed = PlayerEventHandler.OnConnectionFailed;
    pluginPlayer.OnAuthenticationFailed = PlayerEventHandler.OnAuthenticationFailed;
    pluginPlayer.OnStreamNotFound = PlayerEventHandler.OnStreamNotFound;
    pluginPlayer.OnNetworkDisconnected = PlayerEventHandler.OnNetworkDisconnected;
    pluginPlayer.OnRenderError = PlayerEventHandler.OnRenderError;
    pluginPlayer.OnRenderingComplete = PlayerEventHandler.OnRenderingComplete;
    pluginPlayer.OnStreamInfoReady = PlayerEventHandler.OnStreamInfoReady;
    pluginPlayer.OnBufferingStart = PlayerEventHandler.OnBufferingStart;
    pluginPlayer.OnBufferingComplete = PlayerEventHandler.OnBufferingComplete;
    pluginPlayer.OnBufferingProgress = PlayerEventHandler.OnBufferingProgress;
    pluginPlayer.OnCurrentPlayTime = PlayerEventHandler.OnCurrentPlayTime;
};

PlayerEventHandler.OnConnectionFailed = function() {
	Logger.log("Player error: Connection failed");
	PlayerEventHandler.restartPlayback();
};

PlayerEventHandler.OnAuthenticationFailed = function() {
	Logger.log("Player error: Authentication failed");
	PlayerEventHandler.restartPlayback();
};

PlayerEventHandler.OnStreamNotFound = function() {
	Logger.log("Player error: Stream not found");
	PlayerEventHandler.restartPlayback();
};

PlayerEventHandler.OnNetworkDisconnected = function() {
	Logger.log("Player error: Network disconnected");
	PlayerEventHandler.restartPlayback();
};

PlayerEventHandler.OnRenderError = function(errorType) {
	switch (errorType) {
	case 0:
		Logger.log("Player render error: Unknown media type");
		break;
	case 1:
		Logger.log("Player render error: Unsupported container");
		break;
	case 2:
		Logger.log("Player render error: Unsupported video codec");
		break;
	case 3:
		Logger.log("Player render error: Unsupported audio codec");
		break;
	case 4:
		Logger.log("Player render error: Unsupported video resolution");
		break;
	default:
		Logger.log("Player render error: Unknown error (type: " + errorType + ")");
	}
	PlayerEventHandler.restartPlayback();
};

PlayerEventHandler.restartPlayback = function() {
	if (Player.state != Player.STOPPED) {
		PlayerEventHandler.retryCount++;
		if(PlayerEventHandler.retryCount <= PlayerEventHandler.MAX_RETRIES) {
			Logger.log("Restarting playback, attempt " + PlayerEventHandler.retryCount + "/" + PlayerEventHandler.MAX_RETRIES);
			PlayerEventHandler.progressSeconds = PlayerEventHandler.currentSeconds;
			PlayerEventHandler.autoJump = true;
			Player.stopPlayback();
			Player.startPlayback();
		} else {
			Logger.log("Max number of playback retries exceeded, giving up");
			PlayerEventHandler.retryCount = 0;
			PlayerEventHandler.autoJump = false;
			Player.stopVideo();
		}
	}
};

PlayerEventHandler.OnRenderingComplete = function() {
	Logger.log("Player info: Rendering complete");
	MenuManager.playbackComplete();
};

PlayerEventHandler.OnStreamInfoReady = function() {
	Logger.log("Player info: Stream ready");
	Graphics.showBuffer("SR");
};

PlayerEventHandler.OnBufferingStart = function() {
	Logger.log("Player info: Buffering started");
	Graphics.showBuffer("0%");
};

PlayerEventHandler.OnBufferingProgress = function(percent) {
	Logger.log("Player info: Buffering: " + percent + "%");
	Graphics.showBuffer(percent + "%");
};

PlayerEventHandler.OnBufferingComplete = function() {
	Logger.log("Player info: Buffering complete");
	Graphics.showBuffer("100%");
	Graphics.hideBuffer();
	PlayerEventHandler.retryCount = 0;
	PlayerEventHandler.jumpToPreviousLocation();
	Graphics.showPlayerInfo(Player.getStateDescription());
};

PlayerEventHandler.OnCurrentPlayTime = function(millis) {
	if(PlayerEventHandler.currentSeconds == 0 && millis > 1000) {
		Logger.log("Got first OnCurrentPlayTime event, millis = " + millis);
	}
	PlayerEventHandler.updateProgress(millis);
	Subtitle.findAndDisplay(millis);
};

PlayerEventHandler.jumpToPreviousLocation = function() {
	if (PlayerEventHandler.autoJump) {
		setTimeout(function() {
			Logger.log("Jumping to previous location: +" + PlayerEventHandler.progressSeconds + "s");
			PlayerEventHandler.autoJump = false;
			Player.jumpForward(PlayerEventHandler.progressSeconds);
		}, 2000);
	}
};

PlayerEventHandler.updateProgress = function(millis) {
	PlayerEventHandler.currentSeconds = Math.floor(millis / 1000);
	if(PlayerEventHandler.durationSeconds == 0) {
		PlayerEventHandler.durationSeconds = Math.floor(pluginPlayer.GetDuration() / 1000);
	}
};

PlayerEventHandler.getPrettyProgress = function() {
	var prettyCurrent = TimeAndDate.prettyTime(PlayerEventHandler.currentSeconds);
	var prettyDuration = TimeAndDate.prettyTime(PlayerEventHandler.durationSeconds);
	return prettyCurrent + " / " + prettyDuration;
};
