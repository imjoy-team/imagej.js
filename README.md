# ImageJ.JS: ImageJ running in the browser
[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=imagej&plugin=https://ij.imjoy.io)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imagej-js-notebooks/master?filepath=examples%2Fgetting-started.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imagej-js-notebooks/blob/master/examples/getting-started.ipynb)

[ImageJ](https://imagej.nih.gov/ij/) is an open source image processing program designed for scientific multidimensional images. It was originally written in Java and available mainly on desktop computers. We compiled it into [WebAssembly](https://webassembly.org/) and Javascript with a Java compiler called [CheerpJ](https://www.leaningtech.com/pages/cheerpj.html) with additional features to connect it with the ImJoy plugin ecosystem.

You can run ImageJ with all mainstream browsers with one click, no installation and no Java runtime environment needed. It also works on mobile devices.

Try ImageJ.JS here: https://ij.imjoy.io

![](src/assets/img/screenshot-1.png)



This project is currently under development, please expect frequent changes.

## Sharing images, macro or plugins with URL parameters

ImageJ.JS web app supports loading predefined images, macro or plugin by constructing a URL. The following options are supported:
1. `open`: used to open an image or macro script automatically when the user click the link. For example: `https://ij.imjoy.io/?open=https://github.com/imjoy-team/imagej.js/blob/master/src/assets/img/screenshot-1.png`.
2. `run`: used to directly run a macro script stored under a url, e.g. on Github or Gist. For example: `https://ij.imjoy.io/?run=https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac`.
2. `plugin`: used to load an ImJoy plugin when the user click the link. For example: `https://ij.imjoy.io/?plugin=https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html`

If you want to use two options `open` and `run`, then use `&` to connect them: `https://ij.imjoy.io/?open=https://github.com/imjoy-team/imagej.js/blob/master/src/assets/img/screenshot-1.png&run=https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac`

You can also use multple times the same option, for example open multiple `open`, you just need to connect them with `&` as the above example.

**Note for the URL**: not every url can be loaded into ImageJ.JS, it must be starts with `https` and the site should have [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) enabled. In general you can load files from Github repository,  [Gist](https://gist.github.com/) and [Zenodo](https://zenodo.org/). Typically, Github or Gist is suitable for storing macro files or small test images, if you have large images Zenodo is recommended.

### Example usage: sharing macro via Github/Gist
If you made a ImageJ macro that you want to share, you can store them in your project repo on Github, or simply go to Gist(https://gist.github.com), paste it and get the URL. For example, we stored a demo macro here: https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac. Note: set the file extension as `.ijm`.

Then wen can construct an URL for sharing where user can directly click and run: https://ij.imjoy.io/?run=https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac . This URL can be shared as is, or further shorten by one of the short URL service (e.g. tiny.cc).

## Install new ImageJ plugins
Currently, we don't support install plugin downloaded locally, all the plugines need to be installed from the ImageJ.JS site.

To install a new ImageJ plugin, please make an issue with the following information:
 1. name of the plugin
 2. what does the plugin do and how to use it
 2. a publicly accessible url to the jar file, preferably a link to github release

NOTE: **Only ImageJ-1 plugins are supported for now.**

## ImJoy Integration and API

ImageJ.JS supports two-way integration with ImJoy, meaning you can either use it as an ImJoy plugin or load other ImJoy plugins into ImageJ.JS. This a a powerful combination, since it brings useful features from ImageJ including file IO, image processing plugins, macro scripting together with web plugins in ImJoy for building easy to use modern UI and powerful deep learning libraries.

In the standalone mode (simply go to https://ij.imjoy.io), you will have acess to ImJoy features via the ImJoy icon located in the top-left corner of ImageJ. You can load ImJoy plugins into the workspace via a plugin URL, especially for those plugin that calls ImageJ.JS.

For example, the following code shows how to call ImageJ.JS api from an ImJoy plugin:
```javascript
const ij = await api.getWindow("ImageJ.JS")
...
// assuming we have an input image to be processed
await ij.viewImage(inputImage)
await ij.runMacro("...my ijm macro for image processing...")
const result = await ij.getImage()
```

You can use also ImageJ.JS as an ImJoy plugin by using its url:
```javascript
const ij = await api.createWindow({src: "https://ij.imjoy.io"})

// assuming we have an input image to be processed
await ij.viewImage(inputImage)
await ij.runMacro("...my ijm macro for image processing...")
const result = await ij.getImage()
```

The most common use case is to use it with Python, e.g. in a Jupyter notebook or in ImJoy.

Try an online demo: [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imagej.js/master?filepath=examples%2Fgetting-started.ipynb)

### viewImage(img_array, config)
Load an image into ImageJ.JS. For example, you can pass images from Python with numpy arrays or raw bytes in other image file formats (e.g PNG). The shape can have the following format:
 * [height, width]
 * [height, width, 1]
 * [height, width, 3] (will show as RGB image)
 * [height, width, z-stack]
 * [z-stack, height, width, 1]
 * [z-stack, height, width, 3] (will show as a stack of RGB image)

`config` is optional for numpy array, you can use it to specify file name. For example: `{"name": "my image"}`
```python
import imageio

image = imageio.imread("https://images.proteinatlas.org/115/672_E2_1_blue_red_green.jpg")

ij = await api.createWindow(src="https://ij.imjoy.io")
await ij.viewImage(image)

```

If you pass raw bytes of an image in other formats, you need to specify the file name with the corresponding file extension. For example: `ij.viewImage(image_bytes, {"name": "my_image.png"})`.

### getImage(format)

Get the current image (current slice for a stack), for example, in Python you can get it as numpy array by setting the format to "ndarray".
```python
ij = await api.createWindow(src="https://ij.imjoy.io")
img = await ij.getImage("ndarray")
```
Optionally, you can specify it as "tiff", "png", "jpeg", "gif", "zip", "raw", "avi", "bmp", "fits", "pgm", "text image", "lut", "selection", "measurements", "xy Coordinates" or "text".

For a stack, `format` can be set as an object with keys: `channel`, `slice`, `frame` (the values are one-based indexes), otherwise it will return the data of the current slice. 

### getDimensions()
Return the dimensions of the image as an array of [`width`, `height`, `nChannels`, `nSlices`, `nFrames`].

### selectWindow(title)
Select the current window by its title.

### getSelection()
Get the ROI selection in the current image.

The returned roi is a encoded byte string, to parse it, you can use https://github.com/hadim/read-roi/.

### addMenuItem(config)
Add a menu item to the `Plugins` menu.

```python
ij = await api.createWindow(src="https://ij.imjoy.io")

def sayHello():
    api.alert('hello')

img = await ij.addMenuItem({"label": "Say Hello", "callback": sayHello})
```

### runMacro(macro, args)
Run macro string with an optional arguments.
```python
ij = await api.createWindow(src="https://ij.imjoy.io")

await ij.runMacro("close();")
```

### installMacro(macro)
Install a macro (string).
```python
ij = await api.createWindow(src="https://ij.imjoy.io")

myMacro = open("my_macro_to_install.ijm", "r").read()
await ij.installMacro(myMacro)
```

### installTool(tool)
Install a macro tool (string).
```python
ij = await api.createWindow(src="https://ij.imjoy.io")

myMacroTool = open("my_macro_tool_to_install.ijm", "r").read()
await ij.installTool(myMacroTool)
```

### runPlugIn(className, args)
Run plugin by its class name with an optional arguments.

### open()
Open an image. 

Note, you can also pass an optional path, but since ImageJ.JS won't be able to access your file system, so most cases, you can just skip the `path` and it will popup a dialog to ask the user to select.

### save()
Save the current image.


## Benchmark
We did a preliminary benchmark to check the performance, and it seems ImageJ.JS is ~3x slower than the native.

We ran the following macro on both ImageJ.JS and the native Java version on MacOS.
```javascript
run("AuPbSn 40");
for(i=0;i<5000;i++){
  run("Smooth");
}
print("done");
```
ImageJ.JS took 15s, ImageJ took 5s.


However, running plugins can be much slower (e.g. 6x or more) since it uses on-the-fly with a simpler compiler.

```javascript
run("AuPbSn 40");
for(i=0; i<60; i++){
  run("Fast Filters", "link filter=mean x=5 y=5 preprocessing=none offset=128");
}
print("done")
```
ImageJ.JS takes 14.20s, ImageJ takes 2.40s.

We are currently investigating ways to compile plugins in advance to boost the performance.


## Development

### Run the ImageJ.JS site locally

Before start, please make sure you have [nodejs](https://nodejs.org/en/download/) installed.

```bash
git clone https://github.com/imjoy-team/imagej.js
cd imagej.js
npm install
npm build # files will be saved into ./dist folder
sh get-imagej.sh # fetch precompiled imagej
npm run serve
```

Now you can go to http://127.0.0.1:9090/ to visit your local site.

If you make any changes to the code, you might need to reload the page to see them.

### Compile ImageJ into Javascript
The above step runs [`get-imagej.sh`](https://github.com/imjoy-team/imagej.js/blob/master/get-imagej.sh) to obtain the precompiled imagej with plugins. You can compile them locally by following these:

Before start, you need to:
 1. download and install [maven](https://maven.apache.org/download.cgi)
 1. download and install [cheerpj compiler](https://www.leaningtech.com/pages/cheerpj.html#Download)

    Change the following path to your actual path of cheerpj:
    ```bash
    # set CHEERPJ_DIR
    export CHEERPJ_DIR=/path/to/your/cheerpj/installation
    ```
 1. compile imagej with maven
    ```bash
    git clone https://github.com/imjoy-team/ImageJA.JS
    cd ImageJA.JS
    # compile imagej
    mvn install:install-file -Dfile=${CHEERPJ_DIR}/cheerpj-dom.jar -DgroupId=com.learningtech -DartifactId=cheerpj-dom -Dversion=1.0 -Dpackaging=jar
    mvn -Pdeps package
    ```
 1. compile imagej jar into js
    ```bash
    cd target
    mv ij-1.53e.jar ij.jar
    # compile ij.jar and we should get
    ${CHEERPJ_DIR}/cheerpjfy.py ij.jar
    ```
 1. compile a plugin, take MorphoLibJ plugin as an example:
    ```bash
    mkdir -p plugins
    # download MorphoLibJ
    curl https://github.com/ijpb/MorphoLibJ/releases/download/v1.4.2.1/MorphoLibJ_-1.4.2.1.jar -LO
    mv MorphoLibJ_-1.4.2.1.jar plugins/MorphoLibJ_-1.4.2.1.jar
    # compile MorphoLibJ
    ${CHEERPJ_DIR}/cheerpjfy.py  --deps=ij.jar plugins/MorphoLibJ_-1.4.2.1.jar
    # extract plugins.config
    jar xf plugins/MorphoLibJ_-1.4.2.1.jar plugins.config
    ```

The compiled files can be placed under imagej.js/dist folder, and used by your local imagej.js site.
Note: you may need to adjust the imagej jar file name to keep consistent with the one defined in `index.js`.



