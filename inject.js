//var url = (window.location != windowparent.location) ? document.referrer: document.location;
var currentUrl = window.location.href; 
var player = document.getElementById('movie_player');
var playbackQuality, playbackRate, playerState, currentTime, currentLoadedFraction;
var videoUrl;

if (!player) {
	setTimeout(function(){ 
		player = document.getElementById('movie_player');
		alert("getting player again");
		init();
		logOnce();}, 500); //TODO: after dom load
} else {
	init();
}

function init () {
	player.addEventListener("onStateChange", "state_handle");
	player.addEventListener("onPlaybackQualityChange", "playbackQuality_handle");
	player.addEventListener("onPlaybackRateChange", "playbackRate_handle");
	player.addEventListener("onError", "error_handle");
	
	playbackQuality = player.getPlaybackQuality();
	playbackRate = player.getPlaybackRate();
}

function logOnce() {
	var videoDuration, volume, availableQualities, availableRates, playList;
	videoUrl = player.getVideoUrl();
	videoDuration = player.getDuration();
	volume = player.getVolume();
	availableQualities = player.getAvailableQualityLevels().toString();
	availableRates = player.getAvailablePlaybackRates().toString();
	//TODO: playlistindex could change in same window
	playList = player.getPlaylistIndex();
	
	window.postMessage({
		from: "FROM_INJECTED_PAGE_0", 
		url:videoUrl,
		videoDur:videoDuration,
		vol:volume,
		availableQ:availableQualities,
		availableR:availableRates,
		lenPlayList:playList
	}, "*"); 
}

var timer = function() {
	setInterval(messageContentScript, 10000);
}

function state_handle() {
	playerState = player.getPlayerState();
	if (playerState == 0) { clearInterval(timer); console.log("timer"); };
	//TODO: where to put logOnce
	if (playerState == -1) { timer(); logOnce(); console.log("restart timer"); };
	messageContentScript();
}

function playbackQuality_handle() {
	playbackQuality = player.getPlaybackQuality();
	messageContentScript();
}

function playbackRate_handle() {
	playbackRate = player.getPlaybackRate();
	messageContentScript();
}

function messageContentScript () {
	currentTime = player.getCurrentTime(); // get time from youtube time bar;
	currentLoadedFraction = player.getVideoLoadedFraction();
	
	window.postMessage({
		from: "FROM_INJECTED_PAGE", 
		playS:playerState,
		cTime:currentTime,
		load:currentLoadedFraction,
		playQ:playbackQuality,
		playR:playbackRate,
		url:videoUrl
	}, "*"); 
}

// console.log(currentUrl); 