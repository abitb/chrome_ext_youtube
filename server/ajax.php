<?php
header("Access-Control-Allow-Origin: *"); 

header('Cache-Control: no-cache, must-revalidate');
header('Content-type: text/plain');

function createDB($dbh) {
  $createVideoSQL = 'CREATE TABLE IF NOT EXISTS youtube (' .
    'videoID INTEGER PRIMARY KEY,' .
    'fromIP TEXT,' .
    'url TEXT,' .
    'duration REAL,' .
    'volume INTEGER,' .
    'availableQ TEXT,' .
    'availableR TEXT,' .
    'playListIndex INTEGER,' .
    'timestamp REAL' .
    ')';
  $createLogSQL = 'CREATE TABLE IF NOT EXISTS youtubeLog (' .
    'id INTEGER PRIMARY KEY,' .
    'timestamp REAL,' .
    'playerState INTEGER,' .
    'currentTime REAL,' .
    'currentLoadedFraction REAL,'.
    'playbackQuality TEXT,' .
    'playbackRate INTEGER,' .
    'fromIP TEXT,' .
    'url TEXT' .
    ')';
  try {
    $dbh -> exec($createVideoSQL);
    $dbh -> exec($createLogSQL);
  } catch (PDOException $e) {
    die("DB ERROR: " . $e -> getMessage());
  }
}

// prepare statement and execute query
function prepare_stmt($dbh, $sql, $arr){
  $stmt = $dbh -> prepare($sql);
  $stmt -> execute($arr);
  if (isset($errorInfo[2])) {
    $error = $errorInfo[2];
  }
}

// save at same directory with php file
$dsn = 'sqlite:' . dirname(__FILE__) . "\\test.db";
// if $dbh is not global, needs to be passed to local scope
$dbh = new PDO($dsn);
createDB($dbh);

// set value to be empty string if no value comes in
$setdefaul = array("realTime", "playS", "cTime", "load", "playQ", "playR", "url", "url", "videoDur", "vol", "availableQ", "availableR", "playList");
foreach ($setdefaul as $value) {
  if (!isset($_POST[$value])){
    $_POST[$value] = "";
  }
}

try {
  // $timestampQuery = "CAST(strftime('%s','now') || '.' || substr(strftime('%f','now'),4,3) AS REAL)";
  $error = NULL;
  
  if ($_POST["from"] == "FROM_INJECTED_REPEAT") {
    
    $youtubeLogSQL = "INSERT INTO youtubeLog ( timestamp, playerState, currentTime, currentLoadedFraction, playbackQuality, playbackRate, url, fromIP ) VALUES (" . 
    " ?, ?, ?, ?, ?, ?, ?, ? ) ";
    prepare_stmt($dbh, $youtubeLogSQL, array($_POST["realTime"], $_POST["playS"], $_POST["cTime"], $_POST["load"], $_POST["playQ"], $_POST["playR"], $_POST["url"], $_SERVER['REMOTE_ADDR']));
    
  } elseif ($_POST["from"] == "FROM_INJECTED_ONCE") {
    
    $youtubeSQL = "INSERT INTO youtube ( timestamp, url, duration, volume, availableQ, availableR, playListIndex, fromIP ) VALUES (" .
    " ?, ?, ?, ?, ?, ?, ?, ?)";
    prepare_stmt($dbh, $youtubeSQL, array($_POST["realTime"], $_POST["url"], $_POST["videoDur"], $_POST["vol"], $_POST["availableQ"], $_POST["availableR"], $_POST["playList"], $_SERVER["REMOTE_ADDR"]));
    
  }
} catch (Exception $e) {
  $error = $e -> getMessage();
  echo $error;
}

// for dubug
// $str = json_encode($_POST);
// echo "hello: " . dirname(__FILE__). $str;

?>