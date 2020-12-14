# the compiled files will be saved in ./dist
set -e

curl -s https://api.github.com/repos/imjoy-team/ImageJA.JS/releases/latest | \
grep "/imagej-js-dist.tgz" | \
cut -d : -f 2,3 | \
tr -d \" | \
xargs -I {} curl -OL {}

tar -xvzf imagej-js-dist.tgz
rm imagej-js-dist.tgz

# download imagej 1.53f to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53f/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

mkdir -p dist

cp -a imagej-js-dist/. dist/
rm -rf imagej-js-dist