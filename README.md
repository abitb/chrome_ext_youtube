# chrome_ext_youtube
log youtube traffic data

## Packaging Instruction:
package all content under extension/ into a .crx file, [instruction](https://developer.chrome.com/extensions/packaging)
change the testing url to the production url in:
- extension/manifest.json under "permissions"
- extension/background.js

## What's in server/
- ajax.php:  the server file that listens to the incoming post requests
- graph_use_esutil.py:  a sample script demostrates how to query the database and plot the streaming data
- sqlite_util.py: esutil.sqlite_util module, loads data into numpy array from sqlite databse. included in this repo for convenience, [go to author of this module](https://code.google.com/p/esutil/)


