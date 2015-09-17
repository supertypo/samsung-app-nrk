#!/bin/bash
GCC_CMD="java -jar lib/compiler.jar --charset=UTF-8 --language_in ECMASCRIPT3 --compilation_level WHITESPACE_ONLY"
INPUT="../"
OUTPUT="target"

rm NRK_Nett_TV.js &>/dev/null
rm NRK_Nett_TV.zip &>/dev/null

mkdir -p $OUTPUT
cp -a $INPUT/app $INPUT/icon $INPUT/images $INPUT/plugins $INPUT/config.xml \
    $INPUT/index.html $INPUT/LICENSE.txt $INPUT/NOTICE.txt $INPUT/widget.info $OUTPUT
rm -r $OUTPUT/app/javascript/runtime

echo "Minimizing runtime (js)..."

INPUT_JS="$INPUT/app/javascript/runtime"
$GCC_CMD --externs lib/NRK_Nett_TV-externs.js --externs lib/jquery-1.8-externs.js --js_output_file NRK_Nett_TV.js\
 --js $INPUT_JS/Config.js\
 --js $INPUT_JS/Main.js\
 --js $INPUT_JS/Update.js\
 --js $INPUT_JS/MenuManager.js\
 --js $INPUT_JS/TimeAndDate.js\
 --js $INPUT_JS/Menu.js\
 --js $INPUT_JS/MenuCache.js\
 --js $INPUT_JS/MenuListbox.js\
 --js $INPUT_JS/WebParserNg.js\
 --js $INPUT_JS/ServiceClient.js\
 --js $INPUT_JS/MediaElement.js\
 --js $INPUT_JS/MediaElementClient.js\
 --js $INPUT_JS/MediaElementCache.js\
 --js $INPUT_JS/Subtitle.js\
 --js $INPUT_JS/Player.js\
 --js $INPUT_JS/LastSeen.js\
 --js $INPUT_JS/KeyHandler.js\
 --js $INPUT_JS/Graphics.js\
 --js $INPUT_JS/Background.js\
 --js $INPUT_JS/PlayerEventHandler.js\
 --js $INPUT_JS/Keyboard.js\
 --js $INPUT_JS/KeyboardHandler.js\
 --js $INPUT_JS/Exports.js

echo "Creating app loader (zip)..."
cd $OUTPUT
zip -q -r ../NRK_Nett_TV.zip *
cd ..
rm -r $OUTPUT

echo "Done"
