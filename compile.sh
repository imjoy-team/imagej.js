# This script uses Cheerpj to compile imagej to javascript.
# first, download Cheerpj from https://www.leaningtech.com/pages/cheerpj.html#Download
# Install it and change the following CHEERPJ_DIR to the root path of your cheerpj installation
# The following export line assumes you insalled it to /Applications/cheerpj
# also you need to uncomment it to run

# Usage:
#  1. compile from scratch: COMPILE=1 bash compile.sh
#  2. provide cheerpj binary for compilation:  COMPILE=1 CHEERPJ_DIR=/Applications/cheerpj bash compile.sh
#  3. download precompiled: unset COMPILE && bash compile.sh


# the compiled files will be saved in ./dist
mkdir -p dist
cd dist

if [ -n COMPILE ]
then
    # compile from scratch

    if test -z CHEERPJ_DIR
    then
        curl https://d3415aa6bfa4.leaningtech.com/cheerpj_linux_2.1.tar.gz -LO
        tar -xvf cheerpj_linux_2.1.tar.gz
        export CHEERPJ_DIR=$(pwd)/cheerpj_2.1
    fi
    
    # # download imagej-1 from imagej.net
    export IJ1_VERSION=ij153
    curl http://wsr.imagej.net/distros/cross-platform/${IJ1_VERSION}.zip -LO
    unzip -q -o ${IJ1_VERSION}.zip
    rm ${IJ1_VERSION}.zip
    rm -rf ${IJ1_VERSION}
    mv ImageJ ${IJ1_VERSION}

    # # compile ij.jar and we should get
    cd ${IJ1_VERSION}
    ${CHEERPJ_DIR}/cheerpjfy.py  --pack-jar=ij-packed.jar ij.jar


    # download thunderSTORM
    curl https://github.com/zitmen/thunderstorm/releases/download/v1.3/Thunder_STORM.jar -LO
    mv Thunder_STORM.jar plugins/Thunder_STORM.jar
    ${CHEERPJ_DIR}/cheerpjfy.py --deps=ij.jar --pack-jar=plugins/Thunder_STORM-packed.jar plugins/Thunder_STORM.jar


    # replace with the packed version
    rm ij.jar
    mv ij-packed.jar ij.jar
    rm plugins/Thunder_STORM.jar
    mv plugins/Thunder_STORM-packed.jar plugins/Thunder_STORM.jar
    rm ImageJ.exe
    rm run
    rm -rf ImageJ.app

    # python build_plugins.py
    # ${CHEERPJ_DIR}/cheerpjfy.py --pack-jar=plugins-packed.jar plugins.jar

else

    # try to download from github release
    curl https://github.com/imjoy-team/imagej.js/releases/download/0.1.x/ij153.zip -LO
    unzip -q -o ij153.zip
    rm ij153.zip

fi

