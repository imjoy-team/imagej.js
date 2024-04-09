# the compiled files will be saved in ./dist
set -e


# download imagej 1.53m to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53m/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

# download imagej 1.53m3 to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53m3/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

rm imagej-js-dist.tgz

mkdir -p dist

cp -a imagej-js-dist/. dist/
rm -rf imagej-js-dist