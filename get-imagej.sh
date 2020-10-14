# the compiled files will be saved in ./dist
set -e

curl -s https://api.github.com/repos/imjoy-team/ImageJA.JS/releases/latest | \
grep "/imagej-js-dist.tgz" | \
cut -d : -f 2,3 | \
tr -d \" | \
xargs -I {} curl -OL {}

tar -xvzf imagej-js-dist.tgz
rm imagej-js-dist.tgz

mkdir -p dist

cp -a imagej-js-dist/. dist/
rm -rf imagej-js-dist


# get imagej2
mkdir -p dist/ij211
cd dist/ij211
curl -OL https://github.com/imjoy-team/imagej2-cheerpj/releases/download/v0.1.0/imagej2.zip
unzip imagej2.zip
rm imagej2.zip