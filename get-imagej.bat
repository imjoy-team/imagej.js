@echo off
REM The compiled files will be saved in ./dist

REM download imagej 1.53j to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53j/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

REM download imagej 1.53m to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53m/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

del imagej-js-dist.tgz

if not exist dist mkdir dist

xcopy /E /I imagej-js-dist dist\
rd /s /q imagej-js-dist
