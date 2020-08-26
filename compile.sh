# This script uses Cheerpj to compile imagej to javascript.
# first, download Cheerpj from https://www.leaningtech.com/pages/cheerpj.html#Download
# Install it and change the following CHEERPJ_DIR to the root path of your cheerpj installation
# The following export line assumes you insalled it to /Applications/cheerpj
# also you need to uncomment it to run
# export CHEERPJ_DIR=/Applications/cheerpj # <------change this accordingly

# the compiled files will be saved in ./dist
mkdir -p dist
cd dist

# download imagej-1 from imagej.net
curl http://wsr.imagej.net/distros/cross-platform/ij153.zip --output ./ij.zip
unzip -q -o ij.zip
rm ij.zip
mv ImageJ imagej-1

# compile ij.jar and we should get
cd imagej-1
${CHEERPJ_DIR}/cheerpjfy.py ij.jar