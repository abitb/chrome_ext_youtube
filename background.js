chrome.runtime.onConnect.addListener(function(port){
	console.assert(port.name == "FROM_CONTENT_SCRIPT");
	port.onMessage.addListener(function(msg) {
		if(!db) return;
		db.transaction(
			function(t) {
			  timestampQuery = "CAST(strftime('%s','now') || '.' || substr(strftime('%f','now'),4,3) AS REAL)";
				if (msg.from == "FROM_INJECTED_REPEAT") {
					t.executeSql(" INSERT INTO youtubeLog ( timestamp, playerState, currentTime, currentLoadedFraction, playbackQuality, playbackRate, url ) VALUES (" + timestampQuery +  ", ?, ?, ?, ?, ?, ? ) ", [ msg.playS , msg.cTime, msg.load, msg.playQ, msg.playR, msg.url]);
				} else if (msg.from == "FROM_INJECTED_ONCE"){
					// alert("executeSql");
					t.executeSql(" INSERT INTO youtube ( url, duration, volume, availableQ, availableR, playListIndex, timestamp ) VALUES ( ?, ?, ?, ?, ?, ?," + timestampQuery +" ) ", [ msg.url , msg.videoDur, msg.vol, msg.availableQ, msg.availableR, msg.playList]);
				}
			},
			function(t, e) {
				console.log('Insert row: ' + e.message); } //error callback
        );// end of db.transaction
	}); // end of onMessage.addListener
}); //end of runtime.onConnect.addListener

var db = prepareDatabase();
var createVideoSQL = 'CREATE TABLE IF NOT EXISTS youtube (' +
	'videoID INTEGER PRIMARY KEY,' +
    'url TEXT,' +
    'duration REAL,' +
    'volume INTEGER,' +
    'availableQ TEXT,' +
    'availableR TEXT,' +
    'playListIndex INTEGER,' +
    'timestamp REAL' +
    ')';

var createLogSQL = 'CREATE TABLE IF NOT EXISTS youtubeLog (' +
	'id INTEGER PRIMARY KEY,' +
	'timestamp REAL,' +
	'playerState INTEGER,' +
	'currentTime REAL,' +
	'currentLoadedFraction REAL,'+
	'playbackQuality TEXT,' +
	'playbackRate INTEGER,' +
	'url TEXT' +
	')';

// Open the Web SQL database
function prepareDatabase() {
	var odb = getOpenDatabase();
	if(!odb) {
		alert('Web SQL Not Supported');
		return undefined;
	} else {
		var db = odb( 'testDatabase', '1.0', 'A Test Database', 10 * 1024 * 1024 ); //change db size here
		db.transaction(function (t) {
			t.executeSql( createVideoSQL, [], function(t, s){}, function(t, e) {
				alert('create table: ' + e.message);
			});
			t.executeSql( createLogSQL, [], function(t, s){}, function(t, e) {
				alert('create table: ' + e.message);
			});
		});
		return db;
	}
}
// Check if this browser supports Web SQL
function getOpenDatabase() {
	try {
		if( !! window.openDatabase ) return window.openDatabase;
		else return undefined;
	} catch(e) {
		return undefined;
	}
}


