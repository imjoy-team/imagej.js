# the compiled files will be saved in ./dist
set -e

curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53f/imagej-js-dist-popupmenu.tgz

tar -xvzf imagej-js-dist-popupmenu.tgz
rm imagej-js-dist-popupmenu.tgz

mkdir -p dist

cp -a imagej-js-dist/. dist/
rm -rf imagej-js-dist