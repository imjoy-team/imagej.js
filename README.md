# ImageJ running in the browser
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imagej.js/master?filepath=examples%2Fgetting-started.ipynb)
[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/#/app?workspace=imagej&plugin=https://ij.imjoy.io)
<!-- [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/imjoy-team/imagej.js/blob/master/examples/getting-started.ipynb) -->


Start here: https://ij.imjoy.io


## ImJoy API
You can use ImageJ.JS as an ImJoy plugin, the most common use case is to use it with Python, e.g. in a Jupyter notebook or in ImJoy.

Try an online demo: [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/imjoy-team/imagej.js/master?filepath=examples%2Fgetting-started.ipynb)

### addImage(img_array)
Load an image into ImageJ.JS. For example, you can pass images from Python with numpy arrays. The shape can have the following format:
 * [height, width]
 * [height, width, 1]
 * [height, width, 3] (will show as RGB image)
 * [height, width, z-stack]
 * [z-stack, height, width, 1]
 * [z-stack, height, width, 3] (will show as a stack of RGB image)
```python
import imageio

image = imageio.imread("https://images.proteinatlas.org/115/672_E2_1_blue_red_green.jpg")

ij = await api.createWindow(src="https://ij.imjoy.io")
await ij.addImage(image)

```

### getImage()

Get the current image (3~5 dimensions), for example, in Python you will get it as numpy array.
```python
ij = await api.createWindow(src="https://ij.imjoy.io")
img = await ij.getImage()

```

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

### runPlugIn(className, args)
Run plugin by its class name with an optional arguments.

### open()
Open an image. 

Note, you can also pass an optional path, but since ImageJ.JS won't be able to access your file system, so most cases, you can just skip the `path` and it will popup a dialog to ask the user to select.

### save()
Save the current image.

