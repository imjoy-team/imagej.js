# ImageJ.JS: ImageJ running in the browser
[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=imagej&plugin=https://ij.imjoy.io)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imagej-js-notebooks/master?filepath=examples%2Fgetting-started.ipynb)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imagej-js-notebooks/blob/master/examples/getting-started.ipynb)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.4944984.svg)](https://doi.org/10.5281/zenodo.4944984)


[ImageJ](https://imagej.nih.gov/ij/) is an open source image processing program designed for scientific multidimensional images. It was originally written in Java and available mainly on desktop computers. We compiled it into [WebAssembly](https://webassembly.org/) and Javascript with a Java compiler called [CheerpJ](https://www.leaningtech.com/pages/cheerpj.html) with additional features to connect it with the ImJoy plugin ecosystem.

You can run ImageJ with all mainstream browsers with one click, no installation and no Java runtime environment needed. It also works on mobile devices.

Try ImageJ.JS here: https://ij.imjoy.io

![](src/assets/img/screenshot-1.png)



This project is currently under development, please expect frequent changes.

## Sharing images, macro or plugins with URL parameters

To facilitate the sharing of images, macro, and plugins, ImageJ.JS web app supports loading predefined images, macro or plugin by constructing a URL. The following options are supported:
1. `open`: used to open an image or macro script automatically when the user click the link. For example: `https://ij.imjoy.io/?open=https://github.com/imjoy-team/imagej.js/blob/master/src/assets/img/screenshot-1.png`. **Experimental feature: it can also be a NGFF zarr image URL, for example: https://ij.imjoy.io/?open=https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001237.zarr**
1. `run`: used to directly run a macro script stored under a url, e.g. on Github or Gist. For example: `https://ij.imjoy.io/?run=https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac`.
1. `plugin`: used to load an ImJoy plugin when the user click the link. For example: `https://ij.imjoy.io/?plugin=https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html`
1. `spec`: For ImJoy plugins in Python, by default a free compute service MyBinder will be used to run Python plugins, this `spec` is used to specify the specification of MyBinder server (see details in the **ImJoy Plugin Development**)
1. `engine`: For ImJoy plugins in Python, to specify a local Jupyter notebook server as the ImJoy plugin engine (see details **ImJoy Plugin Development**)
If you want to use two options `open` and `run`, then use `&` to connect them: `https://ij.imjoy.io/?open=https://github.com/imjoy-team/imagej.js/blob/master/src/assets/img/screenshot-1.png&run=https://gist.github.com/oeway/ab45cc8295efbb0fb5ae1c6f9babd4ac`

You can also use multple times the same option, for example open multiple `open`, you just need to connect them with `&` as the above example.

**Note for the URL**: not every url can be loaded into ImageJ.JS, it must be starts with `https` and the site should have [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) enabled. In general you can load files from Github repository,  [Gist](https://gist.github.com/) and [Zenodo](https://zenodo.org/). Typically, Github or Gist is suitable for storing macro files or small test images, if you have large images Zenodo is recommended.

### Encoding file directly to the URL
For small script file, one can directly encode the content into the URL (so you don't need to upload it to a server). The easiest way to use this feature is to open the script/macro editor, then click "Share -> Share via URL" in the menu. You will get a long encoded string followed after `https://ij.imjoy/?open=`.

As a tip, you can use URL shorten services such as [tiny.cc](https://tiny.cc/) to make a very short URL. This will make the url more readable and also fit in a tweet message for example.

Another tip is, if you want to run the script directly, simply change `open` to `run` in the url.

If you are a developer, this is implemented by decompress a long string (i.e. file name + content) encoded with a javascript library named [lz-string](https://github.com/pieroxy/lz-string). If you want to generate a valid string, you need to first make a json object with the file name and content: `{"name": <FILE_NAME>, "content": <FILE_CONTENT>}` then convert it a string and compress it via `LZString.compressToEncodedURIComponent`. Finally, add the compressed string after `https://ij.imjoy/?open=` or `https://ij.imjoy/?run=`. 

Besides Javascript, you can find `lz-string` implementation in other programming languages [here](https://github.com/pieroxy/lz-string#other-languages).

## ImageJ.JS badges

If you use ImageJ.JS in your project, it is recommended to add one of our ImageJ.JS badge to your project repository (e.g. on Github) or website. We have two official badges: ![launch ImageJ.JS](https://ij.imjoy.io/assets/badge/launch-imagej-js-badge.svg) and ![open in ImageJ.JS](https://ij.imjoy.io/assets/badge/open-in-imagej-js-badge.svg). A typical use case is to use the badges with the custom ImageJ.JS URL in a Github repo.

For starting ImageJ.JS (e.g. with preloaded macro or image), you can use the ![launch ImageJ.JS](https://ij.imjoy.io/assets/badge/launch-imagej-js-badge.svg) badge.

Markdown:
```
[![launch ImageJ.JS](https://ij.imjoy.io/assets/badge/launch-imagej-js-badge.svg)](https://ij.imjoy.io)
```

reStructuredText:
```
.. image:: https://ij.imjoy.io/assets/badge/launch-imagej-js-badge.svg
 :target: https://ij.imjoy.io
```

For opening images or macro, you can use the ![open in ImageJ.JS](https://ij.imjoy.io/assets/badge/open-in-imagej-js-badge.svg) badge.


Markdown:
```
[![open in ImageJ.JS](https://ij.imjoy.io/assets/badge/open-in-imagej-js-badge.svg)](https://ij.imjoy.io/?open=YOUR_IMAGE_URL)
```

reStructuredText:
```
.. image:: https://ij.imjoy.io/assets/badge/open-in-imagej-js-badge.svg
 :target: https://ij.imjoy.io/?open=YOUR_IMAGE_URL
```


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

### openVirtualStack(img)
**This function is in experimental state**

Load a virtual stack that provide data in a lazy fashion. The input argument `img` should contain the following properties:
 * name: String, the name of the virtual stack image
 * dtype: String, the data type of the virtual stack image, should be one of the following: `"uint8"`, `"uint16"` or ``"float32"``.
 * width: Integer, width of the virtual stack image
 * height: Integer, height of the virtual stack image
 * nSlices: Integer, the total number of slides in the virtual stack image
 * getSlice: Function, a function that takes an index (`Integer`) as input and return the an `ArrayBuffer` (for Javascript) or `bytes` (for Python) with the specified image plane. 

If successful, it will return a virtual stack ID, with which you can close the virutal stack via `closeVirtualStack(ID)`.


An example in Javascript can be found [here](https://gist.github.com/oeway/7a30f3d0c6eb24e9de68e3cece9a5441), this plugin uses constructs a virtual stack which can be used to dynamically pull data from the [HPA cell atlas](https://www.proteinatlas.org/humanproteome/cell), you can also see it in action [here](https://ij.imjoy.io/?plugin=https://gist.github.com/oeway/7a30f3d0c6eb24e9de68e3cece9a5441) (After loading click "HPACellAtlasImages" menu under the ImJoy icon).


Note: this function can only support 3D image stack, if you want to load 4D or 5D images, you can run the `Stack to Hyperstack` macro to convert it into a Hyperstack, for example:
```js
await ij.runMacro(`run("Stack to Hyperstack...", "order=xyzct channels=4 slices=30 frames=10 display=Grayscale");`)
```

### closeVirtualStack(id)
**This function is in experimental state**

Close the virtual stack by its ID.

### viewZarr(config)
**This function is in experimental state**

Show a zarr image stored with [NGFF](https://ngff.openmicroscopy.org/latest/) format. The input argument `config` is an object contains the following field:
 * source: an URL or a valid Zarr Group object
 * name: name of the image
 * offsetX: starting position for x axis (used to display a small portion of the image plane)
 * sizeX: the size for x axis (used to display a small portion of the image plane)
 * offsetY: starting position for y axis (used to display a small portion of the image plane)
 * sizeY: the size for y axis (used to display a small portion of the image plane)

For example:
```js
const ij = await api.getWindow("ImageJ.JS")
await ij.viewZarr({source: "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001241.zarr", name: '6001241'})
```

A Zarr Group object can be constructed in either Javascript or Python, for example:
```python
from imjoy import api
import zarr
from fsspec.implementations.http import HTTPFileSystem

from imjoy_rpc import register_default_codecs

register_default_codecs()
fs = HTTPFileSystem()

class Plugin:
    async def setup(self):
        pass

    async def run(self, ctx):
        ij = await api.createWindow(
            type="ImageJ.JS", src="https://ij.imjoy.io"
        )
        
        http_map = fs.get_mapper('https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001241.zarr')
        z_group = zarr.open(http_map, mode='r')
        await ij.viewZarr({"source": z_group})


api.export(Plugin())
```
For more Python examples, you can also take a look at the [vizarr](https://github.com/hms-dbmi/vizarr/tree/master/example) repo. For more example NGFF images, you can get them from here: https://www.openmicroscopy.org/2020/11/04/zarr-data.html.


**Note: This function uses Virtual Stack in ImageJ to display, this means it will load the image plane as a whole -- as a result, it doesn't support loading image with large width and height (e.g. much less than 50000 pixels on each dimension ). You will need to use `offsetX`, `offsetY`, `sizeX`, `sizeY` to crop the image plane.**
### getImage(format)

Get the current image (current slice for a stack), for example, in Python you can get it as numpy array by setting the format to "ndarray".
```python
ij = await api.createWindow(src="https://ij.imjoy.io")
img = await ij.getImage("ndarray")
```
Optionally, you can specify it as "tiff", "png", "jpeg", "gif", "zip", "raw", "avi", "bmp", "fits", "pgm", "text image", "lut", "selection", "measurements", "xy Coordinates" or "text".

For a stack, `format` can be set as an object with keys: `channel`, `slice`, `frame` (the values are one-based indexes), otherwise it will return the data of the current slice. If you want to get whole image with all the dimensions, pass `{"all": true}` as `format`.

The following example plugin shows how to get a stack of image and visualize it in the itk-vtk-viewer:
```js
class ImJoyPlugin {
  async setup() {
     const ij = await api.getWindow('ImageJ.JS')
     await ij.runMacro('run("Fly Brain");')
  }

  async run(ctx) {
    const ij = await api.getWindow('ImageJ.JS')
    const img = await ij.getImage({format: 'ndarray', all: true})
    const viewer = await api.createWindow({src: "https://kitware.github.io/itk-vtk-viewer/app/"})
    await viewer.setImage(img)
  }
}

api.export(new ImJoyPlugin())
```

### getDimensions()
Return the dimensions of the image as an array of [`width`, `height`, `nChannels`, `nSlices`, `nFrames`].

### selectWindow(title)
Select the current window by its title.

### getSelection()
Get the ROI selection in the current image.

The returned roi is a encoded byte string, to parse it, you can use https://github.com/hadim/read-roi/.

### addMenuItem(config)
Add a menu item to the `Plugins` menu. You can pass the following arguments:
 * `label`: The label of the menu item
 * `callback`: The callback function for the  menu item
 * `group`: Name of the menu group, the default group is `Plugins`
 * `position`: A index number for the insert position within the menu group, for submenu items, you can pass a string with numbers separated by `.`.  For example: `position="3.2"` means  the second  sub-menu of the third menu item.

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
## ImJoy Plugin Development

Tutorial: https://imjoy.io/docs/#/i2k_tutorial
### Run Python code with Pyodide or Jupyter notebook server

ImageJ.JS supports all the ImJoy plugin types, including those written in Python.

The Python plugin type can be either `web-python` or `native-python`. If you choose `web-python`, then [Pyodide](https://github.com/iodide-project/pyodide) will be used to run Python directly in the browser (no server needed).

?> You can specify python packages via `requirements`(e.g. `{"type": "web-python", "requirements": ["numpy", "pandas"]}`). However, Pyodide only support limited number of libraries, including `numpy`, `scipy`, `pandas`, `scikit-learn`, `pillow` etc.

For accessing more Python libraries, you need to use another type of python which is `native-python`. In order to run it, ImJoy will need to connect to a Jupyter notebook server (JupyterHub or BinderHub). By default, it will automatically connect to MyBinder.org which is a free online Jupyter service. 

?> MyBinder works by building a Docker image based on a specified Github Repo with specification files (e.g. `requirements.txt` for pip, or `environment.yml` for conda). The default spec is `oeway/imjoy-binder-image/master`, and you can change by pass a URL parameter named `spec` to the ImJoy docs (e.g. `https://ij.imjoy.io/?spec=oeway/pyimagej-binder-image/master`)

?> If you want to use your own Jupyter notebook server, you can 1) start your notebook server and obtain the URL with token 2) Pass another URL parameters with your notebook URL as `engine`, for example: `https://ij.imjoy.io/?engine=http://127.0.0.1:8080/?token=fad30034546630efk3923l304s3134o20d2592a3f060f3795`.

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
npm run build # files will be saved into ./dist folder
sh get-imagej.sh # fetch precompiled imagej
npm run serve
```

Now you can go to http://127.0.0.1:9090/ to visit your local site.

If you make any changes to the code, you might need to reload the page to see them.

### Compile a plugin and use it in ImageJ.JS

If you have an ImageJ-1 plugin and you want to use it with ImageJ.JS, you can compile it yourself.
Here are the steps:
 1. get ImageJ.JS running locally by following the steps in **Run the ImageJ.JS site locally**.
 Make sure you have the `ij-*.jar` file and `plugins` folder under the folder named `dist/ij153`.
 1. download and install [cheerpj compiler](https://www.leaningtech.com/pages/cheerpj.html#Download)

    Change the following path to your actual path of cheerpj:
    ```bash
    # set CHEERPJ_DIR
    export CHEERPJ_DIR=/path/to/your/cheerpj/installation
    ```
 1. we can place the plugin jar file under `dist/ij153/plugins` and compile it with cheerpj. 
    Here we can take MorphoLibJ plugin as an example:
    ```bash
    cd dist/ij153
    # download MorphoLibJ
    curl https://github.com/ijpb/MorphoLibJ/releases/download/v1.4.2.1/MorphoLibJ_-1.4.2.1.jar -LO
    mv MorphoLibJ_-1.4.2.1.jar plugins/MorphoLibJ_-1.4.2.1.jar
 
    # compile MorphoLibJ
    ${CHEERPJ_DIR}/cheerpjfy.py  --deps=ij.jar plugins/MorphoLibJ_-1.4.2.1.jar
    # extract plugins.config
    jar xf plugins/MorphoLibJ_-1.4.2.1.jar plugins.config
    mv plugins.config MorphoLibJ_-1.4.2.1.jar.config
    ```
    Now you should get `MorphoLibJ_-1.4.2.1.jar`, `MorphoLibJ_-1.4.2.1.jar.js` and `MorphoLibJ_-1.4.2.1.jar.config` in side `dist/ij153/plugins`
  1. Now. we need to update the text file `dist/ij153/plugins/index.list`, and add a new line with the jar file name (i.e.: `MorphoLibJ_-1.4.2.1.jar`). With this file, ImageJ.JS will know there is a new plugin.
  
  Finally, you can go to http://127.0.0.1:9090/ and see if the plugin works (make sure you started the server via `npm run serve`). In case it doesn't work, you can use the Chrome dev tool to check errors in the console.

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
    mv ij-1.53m.jar ij.jar
    # compile ij.jar and we should get
    ${CHEERPJ_DIR}/cheerpjfy.py ij.jar
    ```

The compiled files can be placed under imagej.js/dist folder, and used by your local imagej.js site.
Note: you may need to adjust the imagej jar file name to keep consistent with the one defined in `index.js`.


## Citation

ImageJ.JS is a part of the ImJoy project, please consider citing the ImJoy paper on Nature Methods (https://www.nature.com/articles/s41592-019-0627-0, free access: https://rdcu.be/bYbGO ):

```
Ouyang, W., Mueller, F., Hjelmare, M. et al. ImJoy: an open-source computational platform for the deep learning era. Nat Methods (2019) doi:10.1038/s41592-019-0627-0
```

Alternatively, you can also cite: [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.4944984.svg)](https://doi.org/10.5281/zenodo.4944984).
