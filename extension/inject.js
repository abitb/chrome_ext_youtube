// warning: not namespace protected, may have potential variable name conflict
var ytExtPlayer, videoUrl, videoDuration, mcs_timer, mcs_timeout, pause_timeOut;
var playerState, playbackQuality, playbackRate;
var hasPlayer = false, mcs_timerInterval = 200;

// try getting Youtube player every 50ms
ytExtPlayer = document.getElementById("movie_player");

if (!ytExtPlayer) {
  var getPlayer_timer = setInterval(function() {
    ytExtPlayer = document.getElementById("movie_player");
    if (!!ytExtPlayer) {
      console.log("ytExtPlayer");
      clearInterval(getPlayer_timer);
      // when finally gets the player, dispatch onHasPlayer event
      var onHasPlayer = new Event("onHasPlayer");
      document.dispatchEvent(onHasPlayer);
    }
  }, 50);
} else {
  console.log("ytExtPlayer");
  add_handles();
  hasPlayer = true;
}

// listen to timer interval change
window.addEventListener("message", function(event) {
  if (event.source == window && event.data.from == "FROM_CONTENT_SCRIPT") {
    if (mcs_timerInterval != event.data.timer && hasPlayer) {
      mcs_timerInterval = event.data.timer;
      resetTimer();
      console.log("try Rest");
    };
  }
}, false);

// listen to the onHasPlayer event, and add event handle
// to the miscellaneous player events dispatched by Youtube API
document.addEventListener("onHasPlayer", function() {
  add_handles();
  hasPlayer = true;
}, false);

function add_handles() {
  ytExtPlayer.addEventListener("onStateChange", "state_handle");
  ytExtPlayer.addEventListener("onPlaybackQualityChange", "playbackQuality_handle");
  ytExtPlayer.addEventListener("onPlaybackRateChange", "playbackRate_handle");
  ytExtPlayer.addEventListener("onError", "error_handle");
}

function resetTimer() {
  clearTimer();
  mcs_timer = setInterval(messageContentScript, mcs_timerInterval);
  console.log(mcs_timerInterval);
}

function clearTimer() {
  if (mcs_timer) {
    clearInterval(mcs_timer);
  };
}

// functions used by handles
function init() {
  var regex = /watch\?\S*v=|&\S*/g;
  var urlFromYtAPI = ytExtPlayer.getVideoUrl();
  var urlFromNavbar = window.location.href;
  if (regex.test(urlFromNavbar)) {
    if (urlFromYtAPI.replace(regex, "") == urlFromNavbar.replace(regex, "")) {

      logOnce();
      resetTimer();
      console.log("yes video!");

    };
  };
}

// log once to the youtube table in the server db
// about the basic video info per video play
function logOnce() {
  videoUrl = window.location.href;
  videoDuration = ytExtPlayer.getDuration();

  var realTime = new Date().getTime()/1000;
  var volume = ytExtPlayer.getVolume();
  var availableQualities = ytExtPlayer.getAvailableQualityLevels();
  var availableRates = ytExtPlayer.getAvailablePlaybackRates();
  var playList = ytExtPlayer.getPlaylistIndex();

  window.postMessage({
    "from" : "FROM_INJECTED_ONCE",
    "realTime" : realTime,
    "url" : videoUrl,
    "videoDur" : videoDuration,
    "vol" : volume,
    "availableQ" : availableQualities.toString(),
    "availableR" : availableRates.toString(),
    "lenPlayList" : playList
  }, "*");

  playerState = ytExtPlayer.getPlayerState();
  playbackQuality = ytExtPlayer.getPlaybackQuality();
  playbackRate = ytExtPlayer.getPlaybackRate();
  messageContentScript();
}

// being called repetitively by timer to log the real time streaming
function messageContentScript() {
  // get time from youtube time bar;
  var realTime = new Date().getTime()/1000;
  var currentTime = ytExtPlayer.getCurrentTime();
  var currentLoadedFraction = ytExtPlayer.getVideoLoadedFraction();

  window.postMessage({
    "from" : "FROM_INJECTED_REPEAT",
    "realTime" : realTime,
    "playS" : playerState,
    "cTime" : currentTime,
    "load" : currentLoadedFraction,
    "playQ" : playbackQuality,
    "playR" : playbackRate,
    "url" : videoUrl
  }, "*");
}

// all of the handles for Youtube API events
function state_handle() {
  playerState = ytExtPlayer.getPlayerState();
  if (playerState == -1) {
    clearTimer();
    init();
    console.log("-1");
    return;
  };

  // if pause time is long, stop the timer
  if (pause_timeOut) {
    clearTimeout(pause_timeOut);
    pause_timeOut = undefined;
  };
  if (playerState == 2) {
    pause_timeOut = setTimeout(function() {
      clearTimer();
    }, Math.round(videoDuration*1000 / 10));
    return;
  }

  if (playerState == 0) {
    clearTimer();
    console.log("videoEnd");
    return;
  };
  if (playerState == 1) {
    if (videoUrl != window.location.href) {
      clearTimer();
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