# This script uses Cheerpj to compile imagej to javascript.
# first, download Cheerpj from https://www.leaningtech.com/pages/cheerpj.html#Download
# Install it and change the following CHEERPJ_DIR to the root path of your cheerpj installation
# The following export line assumes you insalled it to /Applications/cheerpj
# also you need to uncomment it to run
# export CHEERPJ_DIR=/Applications/cheerpj # <------change this accordingly



# the compiled files will be saved in ./dist
mkdir -p dist
cd dist

{ # try to download from github release
    wget https://github.com/imjoy-team/imagej.js/releases/download/0.1.x/imagej-1-packed.zip
    unzip -q -o imagej-1-packed.zip
    rm imagej-1-packed.zip
} || { # if failed then compile
    wget https://d3415aa6bfa4.leaningtech.com/cheerpj_linux_2.1.tar.gz
    tar -xvf cheerpj_linux_2.1.tar.gz
    export CHEERPJ_DIR=$(pwd)/cheerpj_2.1
    # download imagej-1 from imagej.net
    curl http://wsr.imagej.net/distros/cross-platform/ij153.zip --output ./ij.zip
    unzip -q -o ij.zip
    rm ij.zip
    mv ImageJ imagej-1

    # compile ij.jar and we should get
    cd imagej-1
    ${CHEERPJ_DIR}/cheerpjfy.py ij.jar
    python build_plugins.py
    ${CHEERPJ_DIR}/cheerpjfy.py plugins.jar
}

