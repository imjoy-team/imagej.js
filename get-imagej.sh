# the compiled files will be saved in ./dist
set -e


# download imagej 1.53h to make the transition smoother
curl -OL https://github.com/imjoy-team/ImageJA.JS/releases/download/1.53h/imagej-js-dist.tgz
tar -xvzf imagej-js-dist.tgz

# download the latest imagej
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
curl -OL https://github.com/imjoy-team/imagej2-cheerpj/releases/download/v0.0.2/imagej2.zip
unzip imagej2.zip
rm imagej2.zip