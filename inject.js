// warning: not namespace protected, potential variable name conflict
var ytExtPlayer, videoUrl, videoDuration, realTime, mcs_timer, mcs_timeout, pause_timeOut;
var playerState, playbackQuality, playbackRate, currentTime, currentLoadedFraction;

// try getting Youtube player every 100ms
ytExtPlayer = document.getElementById('movie_player');

if (!ytExtPlayer) {
  var getPlayer_timer = setInterval(function() {
    ytExtPlayer = document.getElementById('movie_player');
    if (!!ytExtPlayer) {
      console.log("ytExtPlayer");
      clearInterval(getPlayer_timer);
      // when finally gets the player, dispatch onHasPlayer event
      var onHasPlayer = new Event('onHasPlayer');
      document.dispatchEvent(onHasPlayer);
    }
  }, 100);
} else {
  console.log("ytExtPlayer");
  add_handles();
}

// listen to the onHasPlayer event, and add event handle
// to the miscellaneous player events dispatched by Youtube API
document.addEventListener('onHasPlayer', function() {
  add_handles();
}, false);

function add_handles() {
  ytExtPlayer.addEventListener("onStateChange", "state_handle");
  ytExtPlayer.addEventListener("onPlaybackQualityChange", "playbackQuality_handle");
  ytExtPlayer.addEventListener("onPlaybackRateChange", "playbackRate_handle");
  ytExtPlayer.addEventListener("onError", "error_handle");
}

function resetTimer() {
  clearTimer();
  mcs_timer = setInterval(messageContentScript, 200);
}

function clearTimer() {
  if (mcs_timer) {
    clearInterval(mcs_timer);
  };
}

// functions used by handles
function init() {
  if (ytExtPlayer.getVideoUrl() == window.location.href) {
    logOnce();
    resetTimer();
    console.log("yes video!");
  };
}

// log once to the youtube table in the server db
// about the basic video info per video play
function logOnce() {
  //realTime = Date.now(); 
  // make change to the line about if you don't want the server to keep track of the real time
  
  videoUrl = window.location.href;
  videoDuration = ytExtPlayer.getDuration();

  var volume = ytExtPlayer.getVolume();
  var availableQualities = ytExtPlayer.getAvailableQualityLevels().toString();
  var availableRates = ytExtPlayer.getAvailablePlaybackRates().toString();
  var playList = ytExtPlayer.getPlaylistIndex();

  window.postMessage({
    from : "FROM_INJECTED_ONCE",
    url : videoUrl,
    videoDur : videoDuration,
    vol : volume,
    availableQ : availableQualities,
    availableR : availableRates,
    lenPlayList : playList
  }, "*");

  playerState = ytExtPlayer.getPlayerState();
  playbackQuality = ytExtPlayer.getPlaybackQuality();
  playbackRate = ytExtPlayer.getPlaybackRate();
  messageContentScript();
}

// being called repetitively by timer to log the real time streaming
function messageContentScript() {
  // get time from youtube time bar;
  currentTime = ytExtPlayer.getCurrentTime();
  currentLoadedFraction = ytExtPlayer.getVideoLoadedFraction();

  window.postMessage({
    from : "FROM_INJECTED_REPEAT",
    playS : playerState,
    cTime : currentTime,
    load : currentLoadedFraction,
    playQ : playbackQuality,
    playR : playbackRate,
    url : videoUrl
  }, "*");
}

// all of the handles for Youtube API events
function state_handle() {
  playerState = ytExtPlayer.getPlayerState();
  if (playerState == -1) {
    init();
    console.log("-1");
    return;
  };

  if (pause_timeOut) {
    clearTimeout(pause_timeOut);
    pause_timeOut = undefined;
  };
  if (playerState == 2) {
    pause_timeOut = setTimeout(function() {
      clearTimer();
    }, Math.round(videoDuration / 1.2));
    return;
  }

  if (playerState == 0) {
    clearTimer();
    console.log("videoEnd");
    return;
  };
  if (playerState == 1) {
    if (videoUrl != window.location.href) {
      init();
      console.log("changevid");
      return;
    };
  };
  messageContentScript();
}

function playbackQuality_handle() {
  playbackQuality = ytExtPlayer.getPlaybackQuality();
  messageContentScript();
}

function playbackRate_handle() {
  playbackRate = ytExtPlayer.getPlaybackRate();
  messageContentScript();
}