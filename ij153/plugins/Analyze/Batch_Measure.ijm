// This macro batch measures a folder of images.
// Use the Analyze>Set Measurements command
// to specify the measurement parameters.

    dir = getDirectory("Choose a Directory ");
    list = getFileList(dir);
    setOption("display labels", true);
    setBatchMode(true);
    for (i=0; i<list.length; i++) {
        path = dir+list[i];
        showProgress(i, list.length);
        IJ.redirectErrorMessages();
        open(path);
        if (nImages>=1) {
            run("Measure");
            close();
        } else
            print("Error opening "+path);
    }


