@echo off
set JAVA="c:\Program Files\Java\jre1.8.0_25\bin\java"
set GCC_CMD=%JAVA% -jar lib\compiler.jar --charset=UTF-8 --language_in ECMASCRIPT3 --compilation_level WHITESPACE_ONLY
set INPUT=..\
set OUTPUT=target

del NRK_Nett_TV.js
del NRK_Nett_TV.zip

xcopy /q /e %INPUT%\app %OUTPUT%\app\
rmdir /q /s %OUTPUT%\app\javascript\runtime
xcopy /q /e %INPUT%\icon %OUTPUT%\icon\
xcopy /q /e %INPUT%\images %OUTPUT%\images\
xcopy /q /e %INPUT%\plugins %OUTPUT%\plugins\
copy %INPUT%\config.xml %OUTPUT%
copy %INPUT%\index.html %OUTPUT%
copy %INPUT%\LICENSE.txt %OUTPUT%
copy %INPUT%\NOTICE.txt %OUTPUT%
copy %INPUT%\widget.info %OUTPUT%

set INPUT_JS=%INPUT%\app\javascript\runtime
%GCC_CMD% --externs lib\NRK_Nett_TV-externs.js --externs lib\jquery-1.8-externs.js --js_output_file NRK_Nett_TV.js^
 --js %INPUT_JS%\Config.js^
 --js %INPUT_JS%\Main.js^
 --js %INPUT_JS%\Update.js^
 --js %INPUT_JS%\MenuManager.js^
 --js %INPUT_JS%\TimeAndDate.js^
 --js %INPUT_JS%\Menu.js^
 --js %INPUT_JS%\MenuCache.js^
 --js %INPUT_JS%\MenuListbox.js^
 --js %INPUT_JS%\WebParserNg.js^
 --js %INPUT_JS%\ServiceClient.js^
 --js %INPUT_JS%\MediaElement.js^
 --js %INPUT_JS%\MediaElementClient.js^
 --js %INPUT_JS%\MediaElementCache.js^
 --js %INPUT_JS%\Subtitle.js^
 --js %INPUT_JS%\Player.js^
 --js %INPUT_JS%\LastSeen.js^
 --js %INPUT_JS%\KeyHandler.js^
 --js %INPUT_JS%\Graphics.js^
 --js %INPUT_JS%\Background.js^
 --js %INPUT_JS%\PlayerEventHandler.js^
 --js %INPUT_JS%\Keyboard.js^
 --js %INPUT_JS%\KeyboardHandler.js^
 --js %INPUT_JS%\Exports.js

cd %OUTPUT%
"C:\Program Files\7-Zip\7z.exe" a -tzip ..\NRK_Nett_TV.zip *
cd ..
rmdir /q /s %OUTPUT%

pause