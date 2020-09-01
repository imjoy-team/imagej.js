# the compiled files will be saved in ./dist
set -e

curl -s https://api.github.com/repos/imjoy-team/ImageJA/releases/latest | \
grep "/imagejs-dist.tgz" | \
cut -d : -f 2,3 | \
tr -d \" | \
xargs -I {} curl -OL {}

tar -xvzf imagejs-dist.tgz
rm imagejs-dist.tgz

mkdir -p dist

cp -a imagejs-dist/. dist/
rm -rf imagejs-dist