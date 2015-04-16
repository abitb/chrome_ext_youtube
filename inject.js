//var url = (window.location != windowparent.location) ? document.referrer: document.location;
// var currentUrl = window.location.href; 
var player, videoUrl, videoDuration, realTime, mcs_timer, mcs_timeout, pause_timeOut;
var playerState, playbackQuality, playbackRate, currentTime, currentLoadedFraction;

player = document.getElementById('movie_player');

if (!player) {
	var getPlayer_timer = setInterval( function(){
		player = document.getElementById('movie_player');
		if (!!player) {
			console.log("player");
			clearInterval(getPlayer_timer);
			var onHasPlayer = new Event('onHasPlayer');
			document.dispatchEvent(onHasPlayer);
		}
	},100);
} else { 
	console.log("player");
	add_handles(); }

document.addEventListener('onHasPlayer', function () { add_handles(); }, false);

function init () {
  if (player.getVideoUrl()==window.location.href) {
  	logOnce();
  	resetTimer();
  	console.log("yes video!");
  };	
}

function add_handles () {
	player.addEventListener("onStateChange", "state_handle");
	player.addEventListener("onPlaybackQualityChange", "playbackQuality_handle");
	player.addEventListener("onPlaybackRateChange", "playbackRate_handle");
	player.addEventListener("onError", "error_handle");
}

function logOnce () {
	realTime = Date.now();

	videoUrl = window.location.href;
	videoDuration = player.getDuration();
	
	var volume = player.getVolume();
	var availableQualities = player.getAvailableQualityLevels().toString();
	var availableRates = player.getAvailablePlaybackRates().toString();
	var playList = player.getPlaylistIndex();
	
	window.postMessage({
		from: "FROM_INJECTED_ONCE", 
		url:videoUrl,
		videoDur:videoDuration,
		vol:volume,
		availableQ:availableQualities,
		availableR:availableRates,
		lenPlayList:playList
	}, "*"); 

	playerState = player.getPlayerState();
	playbackQuality = player.getPlaybackQuality();
	playbackRate = player.getPlaybackRate();
	messageContentScript();
}

function messageContentScript () {
	currentTime = player.getCurrentTime(); // get time from youtube time bar;
	currentLoadedFraction = player.getVideoLoadedFraction();
	
	window.postMessage({
		from: "FROM_INJECTED_REPEAT", 
		playS:playerState,
		cTime:currentTime,
		load:currentLoadedFraction,
		playQ:playbackQuality,
		playR:playbackRate,
		url:videoUrl
	}, "*"); 
}

function resetTimer () {
	clearTimer();
	mcs_timer = setInterval(messageContentScript, 200);
	mcs_timeout = setTimeout(function () {
		clearInterval(mcs_timer);
		mcs_timer = setInterval(messageContentScript, 2000);
		console.log("resetTimer!");
	}, 1000*20);
}

function clearTimer () {
	if (mcs_timer) { clearInterval(mcs_timer); };
	if (mcs_timeout) { clearTimeout(mcs_timeout); };
}

function state_handle () {
	playerState = player.getPlayerState();
	if (playerState == -1) { init(); console.log("-1"); return; };

	if (pause_timeOut) { clearTimeout(pause_timeOut); pause_timeOut = undefined; };
	if (playerState == 2){ pause_timeOut = setTimeout( function(){ clearTimer(); }, Math.round(videoDuration/1.2) ); return; }

	if (playerState == 0) { clearTimer(); console.log("videoEnd"); return; };
	if (playerState == 1) {
		if (videoUrl != window.location.href){ init(); console.log("changevid"); return; };
	};
	if (playerState == 3) { resetTimer(); return; };
	messageContentScript();
}

function playbackQuality_handle () {
	playbackQuality = player.getPlaybackQuality();
	messageContentScript();
}

function playbackRate_handle () {
	playbackRate = player.getPlaybackRate();
	messageContentScript();
}