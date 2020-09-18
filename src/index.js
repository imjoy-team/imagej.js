import { setupImJoyApp } from "./imjoyApp.js";
import { setupImJoyAPI } from "./imjoyAPI.js";
import { githubUrlRaw } from "./utils.js";

import Snackbar from "node-snackbar/dist/snackbar";
import "node-snackbar/dist/snackbar.css";
import A11yDialog from "a11y-dialog";

const isChrome = !!window.chrome;
const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
if (!isChrome && !isFirefox) {
  Snackbar.show({
    text:
      "Note: ImageJ.JS is only tested with Chrome or Firefox, other browsers may not work properly.",
    pos: "bottom-left"
  });
}

const codeEditors = {};
window.onEditorResized = () => {
  setTimeout(() => {
    for (let id in codeEditors) {
      const textArea = document.getElementById(id);
      if (textArea) {
        const bbox = textArea.getBoundingClientRect();
        codeEditors[id].setSize(bbox.width - 10, bbox.height - 10);
      } else {
        delete codeEditors[id];
      }
    }
  }, 1);
};

window.onEditorTextChanged = () => {
  // for(let id in codeEditors){
  //   const textArea = document.getElementById(id);
  //   codeEditors[id].setValue(textArea.value);
  // }
};

// setup a hook for fixing mobile touch event
const _createElement = document.createElement;

function touchClick(ev) {
  ev.target.click();
  ev.preventDefault();
  if (["UL", "LI", "BUTTON", "INPUT", "A"].includes(ev.target.tagName))
    ev.stopPropagation();
}
document.createElement = function(type) {
  const elm = _createElement.call(document, type);
  elm.addEventListener("touchstart", touchClick, false);
  if (elm.nodeName === "TEXTAREA") {
    setTimeout(() => {
      // only apply to textarea in a window
      if (elm.parentNode.nextSibling.classList[0] !== "titleBar") return;
      const editorDiv = _createElement.call(document, "DIV");
      editorDiv.setAttribute("style", elm.getAttribute("style"));
      editorDiv.style["z-index"] = 0;
      const myCodeMirror = CodeMirror(editorDiv, {
        value: elm.value,
        mode: {
          name: "htmlmixed",
          tags: {
            docs: [[null, null, "markdown"]],
            config: [
              ["lang", /^json$/, "javascript"],
              ["lang", /^yaml$/, "yaml"],
              [null, null, "javascript"]
            ],
            script: [
              ["lang", /^python$/, "python"],
              [null, null, "javascript"]
            ]
          }
        },
        lineNumbers: false,
        matchBrackets: true
        // lint: true,
        // gutters: ["CodeMirror-lint-markers"],
      });
      const bbox = elm.getBoundingClientRect();
      myCodeMirror.setSize(bbox.width, bbox.height);
      setTimeout(function() {
        myCodeMirror.refresh();
      }, 1);
      elm.parentNode.appendChild(editorDiv);
      elm.id =
        "_" +
        Math.random()
          .toString(36)
          .substr(2, 9);
      codeEditors[elm.id] = myCodeMirror;
      myCodeMirror.on("change", () => {
        elm.value = myCodeMirror.getValue();
        const event = new Event("input", {
          bubbles: true,
          cancelable: true
        });
        elm.dispatchEvent(event);
      });
    }, 1000);
  }
  return elm;
};

window.debug = async message => {
  console.log(message);
  debugger;
};

// Get the dialog element (with the accessor method you want)
const el = document.getElementById("open-file-dialog");

// Instantiate a new A11yDialog module
const fileDialog = new A11yDialog(el);

window.openFileDialogJS = async (title, initPath, selectionMode, promise) => {
  document.getElementById("dialogTitle").innerHTML = title || "Open File";
  fileDialog.show();
  let closed = false;
  fileDialog.on("hide", function(dialogEl, event) {
    if (!closed) {
      closed = true;
      cjCall(promise, "reject", "cancelled");
    }
  });
  document.getElementById("open-file-modal-select").onclick = () => {
    if (!closed) {
      const fileInput = document.getElementById("open-file");
      fileInput.onchange = () => {
        const files = fileInput.files;
        // TODO: when do we remove this file?
        mountFile(files[0])
          .then(filepath => {
            cjCall(promise, "resolve", filepath);
          })
          .catch(e => {
            cjCall(promise, "reject", String(e));
          });
        fileInput.value = "";
        closed = true;
        fileDialog.hide();
      };
      fileInput.click();
    }
  };
  document.getElementById("open-file-modal-internal").onclick = () => {
    if (!closed) {
      closed = true;
      cjCall(promise, "resolve", "");
    }
    fileDialog.hide();
  };
};

window.saveFileDialogJS = async (title, initPath, selectionMode, promise) => {
  // by pass the selection
  const savePath = prompt(title || "Saving file as ", initPath);
  if (savePath) {
    downloadQueue[savePath] = 1;
    loader.style.display = "block";
    await cjCall(promise, "resolve", "/files/" + savePath);
  } else {
    await cjCall(promise, "reject", "cancelled");
  }
};

window.onFileOpened = (path, error) => {
  if (error) {
    Snackbar.show({
      text: "Failed to load file from " + path,
      pos: "bottom-left"
    });
  }
  cheerpjRemoveStringFile(path);
};

window.openURL = async url => {
  window.open(url);
};

const loader = document.getElementById("loader");
loader.style.display = "none";
window.getBytesFromUrl = async (originalUrl, promise) => {
  try {
    loader.style.display = "block";
    let url = originalUrl.replace("http://", "https://");
    Snackbar.show({
      text: "Fetching data from: " + originalUrl,
      pos: "bottom-left"
    });
    const blob = await fetch(url).then(r => r.blob());
    const buffer = await new Response(blob).arrayBuffer();
    await cjCall(
      promise,
      "resolve",
      cjTypedArrayToJava(new Uint8Array(buffer))
    );
  } catch (e) {
    console.error("Failed to get data from " + originalUrl, e);
    Snackbar.show({
      text: "Failed to fetch data from: " + originalUrl + ": " + e.toString(),
      pos: "bottom-left"
    });
    await cjCall(promise, "reject", e.toString());
  } finally {
    loader.style.display = "none";
  }
};

const downloadQueue = {};

async function startImageJ() {
  loader.style.display = "block";
  let preload = localStorage.getItem("cheepjPreload");
  if (preload) preload = JSON.parse(preload);
  else preload = [];
  cheerpjInit({
    preloadResources: preload,
    enableInputMethods: true,
    clipboardMode: "java",
    enablePreciseClassLoaders: true,
    javaProperties: ["user.dir=/files", "plugins.dir=/app/ij153/plugins"]
  });
  const appContainer = document.getElementById("imagej-container");
  const elm = cheerpjCreateDisplay(-1, -1, appContainer);
  const _addEL = elm.addEventListener;
  elm.addEventListener = (event, handler, options) => {
    if (
      event === "dblclick" ||
      event === "drag" ||
      event.startsWith("mouse") ||
      event === "wheel" ||
      event === "contextmenu"
    ) {
      _addEL.apply(elm, [
        event,
        e => {
          // skip handling mouse events for the cheerpj display and textarea elements
          if (
            e.target !== elm &&
            e.target.nodeName !== "TEXTAREA" &&
            e.target.getAttribute("role") !== "presentation"
          ) {
            handler.apply(null, [e]);
          }
        }
      ]);
    } else {
      _addEL.apply(elm, [event, handler, options]);
    }
  };
  cheerpjRunMain(
    "ij.ImageJ",
    "/app/ij153/ij-1.53d.jar:/app/ij153/plugins/Thunder_STORM.jar"
  );
}

async function listFiles(imagej, path) {
  const files = await imagej.listDir(path);
  return files.map(cjStringJavaToJs);
}

async function mountFile(file) {
  const filepath = "/str/" + file.name;
  const bytes = await readFile(file);
  cheerpjAddStringFile(filepath, bytes);
  return filepath;
}

async function getImageData(imagej, imp, channel, slice, frame) {
  // const name = cjStringJavaToJs(await cjCall(imp, "getTitle"));
  const width = await cjCall(imp, "getWidth");
  const height = await cjCall(imp, "getHeight");
  const slices = { value0: 1 }; //await cjCall(imp, "getNSlices");
  const channels = await cjCall(imp, "getNChannels");
  const frames = { value0: 1 }; // await cjCall(imp, "getNFrames");
  const type = await cjCall(imp, "getType");
  if (channel === undefined) channel = -1;
  if (slice === undefined) slice = -1;
  if (frame === undefined) frame = -1;
  const bytes = javaBytesToArrayBuffer(
    await imagej.getPixels(imp, channel, slice, frame)
  );
  const shape = [height.value0, width.value0, channels.value0];
  if (slices.value0 && slices.value0 !== 1) {
    shape.push(slices.value0);
  }
  if (frames.value0 && frames.value0 !== 1) {
    shape.push(frames.value0);
  }
  const typeMapping = {
    0: "uint8", //GRAY8 8-bit grayscale (unsigned)
    1: "uint16", //GRAY16 16-bit grayscale (unsigned)
    2: "float32", //	GRAY32 32-bit floating-point grayscale
    3: "uint8", // COLOR_256 8-bit indexed color
    4: "uint8" // COLOR_RGB 32-bit RGB color
  };
  const bytesPerPixelMapping = {
    0: 1, //GRAY8 8-bit grayscale (unsigned)
    1: 2, //GRAY16 16-bit grayscale (unsigned)
    2: 4, //	GRAY32 32-bit floating-point grayscale
    3: 1, // COLOR_256 8-bit indexed color
    4: 1 // COLOR_RGB 32-bit RGB color
  };

  // calculate the actual channel number, e.g. for RGB image
  shape[2] =
    bytes.byteLength /
    (shape[0] * shape[1] * (shape[3] || 1) * (shape[4] || 1)) /
    bytesPerPixelMapping[type.value0];

  return {
    type: typeMapping[type.value0],
    shape: shape,
    bytes
  };
}

async function saveImage(imagej, filename, format, ext) {
  format = format || "tiff";

  const imp = await imagej.getImage();
  const original_name = cjStringJavaToJs(await cjCall(imp, "getTitle"));
  filename =
    filename ||
    cjStringJavaToJs(
      await imagej.getString(
        "Saving file as ",
        original_name.split(".")[0] + (ext || "." + format)
      )
    );
  if (filename) {
    const fileBytes = javaBytesToArrayBuffer(
      await imagej.saveAsBytes(imp, format)
    );
    downloadBytesFile([fileBytes.buffer], filename);
  }
}

function downloadBytesFile(fileByteArray, filename) {
  const blob = new Blob(fileByteArray, {
    type: "application/octet-stream"
  });

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

function openImage(imagej, path) {
  if (path) {
    return imagej.open(path);
  }
  return new Promise((resolve, reject) => {
    const fileInput = document.getElementById("open-file");
    fileInput.onchange = () => {
      const files = fileInput.files;
      for (let i = 0, len = files.length; i < len; i++) {
        if (
          files[i].name.endsWith(".jar") ||
          files[i].name.endsWith(".jar.js")
        ) {
          saveFileToFS(imagej, files[i])
            .then(resolve)
            .catch(reject);
        } else {
          mountFile(files[i])
            .then(filepath => {
              imagej
                .open(filepath)
                .then(resolve)
                .catch(reject)
                .finally(() => {
                  cheerpjRemoveStringFile(filepath);
                });
            })
            .catch(reject);
        }
      }
      fileInput.value = "";
    };
    fileInput.click();
  });
}

function javaBytesToArrayBuffer(bytes) {
  return bytes.slice(1).buffer;
}

async function saveFileToFS(imagej, file) {
  const bytes = await readFile(file);
  await imagej.saveBytes(cjTypedArrayToJava(bytes), "/files/" + file.name);
  console.log(await listFiles(imagej, "/files/"));
}

async function fixMenu(imagej) {
  const removes = [
    "Show Folder",
    "Update ImageJ...",
    "Compile and Run...",
    "Capture Screen",
    "Capture Delayed...",
    "Capture Image"
  ];
  const items = document.querySelectorAll(
    "#cheerpjDisplay>.window:nth-child(2) li > a"
  );
  for (let it of items) {
    if (removes.includes(it.text)) {
      // remove li
      const el = it.parentNode;
      el.parentNode.removeChild(el);
    }
    // else if (it.text === "Open...") {
    //   const openNode = it.parentNode;
    //   const openMenu = openNode.cloneNode(true);
    //   it.text = "Open Internal"
    //   openMenu.onclick = e => {
    //     e.stopPropagation();
    //     openImage(imagej);
    //   };
    //   openNode.parentNode.insertBefore(openMenu, openNode)
    // }
  }

  // addMenuItem({label: "Debug", async callback(){
  // const bytesIn = new Int8Array(new ArrayBuffer(30));
  // bytesIn[0] = 33;
  // bytesIn[2] = 99;
  // await imagej.saveBytes(cjTypedArrayToJava(bytesIn), "/files/test.bin");
  // const bytesOut = await imagej.openAsBytes('/files/test.bin')

  // }})
}

function setupDragAndDrop(imagej) {
  const appContainer = document.getElementById("imagej-container");
  const dragOverlay = document.getElementById("drag-overlay");

  appContainer.addEventListener(
    "dragenter",
    e => {
      if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        dragOverlay.style.display = "block";
      }
    },
    false
  );
  appContainer.addEventListener(
    "dragover",
    e => {
      if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        dragOverlay.style.display = "block";
      }
    },
    false
  );
  appContainer.addEventListener(
    "dragleave",
    e => {
      if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        dragOverlay.style.display = "none";
      }
    },
    false
  );
  appContainer.addEventListener(
    "drop",
    e => {
      if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        e.stopPropagation();
        const data = e.dataTransfer,
          files = data.files;
        for (let i = 0, len = files.length; i < len; i++) {
          if (
            files[i].name.endsWith(".jar") ||
            files[i].name.endsWith(".jar.js")
          ) {
            saveFileToFS(imagej, files[i]);
          } else {
            mountFile(files[i]).then(filepath => {
              imagej.open(filepath).finally(() => {
                cheerpjRemoveStringFile(filepath);
              });
            });
          }
        }
        dragOverlay.style.display = "none";
      }
    },
    false
  );
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function() {
      const arrayBuffer = reader.result;
      const bytes = new Uint8Array(arrayBuffer);
      resolve(bytes);
    };
    reader.onerror = function(e) {
      reject(e);
    };
  });
}

function fixHeight() {
  // fix ios height issue
  function resetHeight() {
    // reset the body height to that of the inner browser
    document.body.style.height = window.innerHeight + "px";
  }
  // reset the height whenever the window's resized
  window.addEventListener("resize", resetHeight);
  // called to initially set the height.
  resetHeight();
}

function addMenuItem(config) {
  const newMenu = document.createElement("li");
  newMenu.classList.add("menuItem");
  newMenu.classList.add("subMenuItem");
  const button = document.createElement("a");
  button.innerHTML = config.label;
  newMenu.appendChild(button);
  newMenu.onclick = () => {
    config.callback();
  };
  const menuIndexs = {
    File: 1,
    Edit: 2,
    Image: 3,
    Process: 4,
    Analyze: 5,
    Plugins: 6,
    Window: 7,
    Help: 8
  };
  const index = menuIndexs[config.group || "Plugins"];

  const targetMenu = document.querySelector(
    `#cheerpjDisplay>.window>div.menuBar>.menu>.menuItem:nth-child(${index})>ul`
  );
  if (config.position) {
    targetMenu.insertBefore(newMenu, targetMenu.children[config.position]);
  } else {
    targetMenu.appendChild(newMenu);
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("/service-worker.js").then(
        function(registration) {
          // Registration was successful
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        function(err) {
          // registration failed :(
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
}

function iOS() {
  return (
    [
      "iPad Simulator",
      "iPhone Simulator",
      "iPod Simulator",
      "iPad",
      "iPhone",
      "iPod"
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
}

function fixStyle() {
  if (iOS()) {
    // Create our stylesheet
    var style = document.createElement("style");
    style.innerHTML = `.titleBar>.controls {
      margin-top: -5px;
      color: white !important;
    }
    `;
    // Get the first script tag
    var ref = document.querySelector("script");

    // Insert our new styles before the first script tag
    ref.parentNode.insertBefore(style, ref);
  }
}

function touchHandler(event) {
  var touches = event.changedTouches,
    first = touches[0],
    type = "";
  switch (event.type) {
    case "touchstart":
      type = "mousedown";
      break;
    case "touchmove":
      type = "mousemove";
      break;
    case "touchend":
      type = "mouseup";
      break;
    default:
      return;
  }

  // initMouseEvent(type, canBubble, cancelable, view, clickCount,
  //                screenX, screenY, clientX, clientY, ctrlKey,
  //                altKey, shiftKey, metaKey, button, relatedTarget);

  var simulatedEvent = document.createEvent("MouseEvent");
  simulatedEvent.initMouseEvent(
    type,
    true,
    true,
    window,
    1,
    first.screenX,
    first.screenY,
    first.clientX,
    first.clientY,
    false,
    false,
    false,
    false,
    0 /*left*/,
    null
  );

  first.target.dispatchEvent(simulatedEvent);
  event.preventDefault();
}

function fixTouch() {
  const titleBar = document.querySelector(".titleBar");
  titleBar.addEventListener("touchstart", touchHandler, true);
  titleBar.addEventListener("touchmove", touchHandler, true);
  titleBar.addEventListener("touchend", touchHandler, true);
  titleBar.addEventListener("touchcancel", touchHandler, true);

  const menus = document.querySelectorAll(".subMenuItem");
  for (let menu of menus) {
    menu.removeEventListener("touchstart", touchClick);
  }
}

registerServiceWorker();
fixHeight();
fixStyle();

function cheerpjRemoveStringFile(name) {
  var mount = cheerpjGetFSMountForPath(name);
  assert(mount instanceof CheerpJDataFolder);
  delete mount.files[name.substr(mount.mountPoint.length - 1)];
  delete mount.fileCache[name];
}

async function processUrlParameters(imagej) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("open")) {
    const urls = urlParams.getAll("open");
    for (let url of urls) {
      try {
        Snackbar.show({
          text: "Opening " + url,
          pos: "bottom-left"
        });
        // convert to raw if we can
        const tmp = await githubUrlRaw(url, ".ijm");
        url = tmp || url;
        await imagej.open(url);
        Snackbar.show({
          text: "Successfully opened " + url,
          pos: "bottom-left"
        });
      } catch (e) {
        Snackbar.show({
          text: "Failed to open " + url,
          pos: "bottom-left"
        });
      }
    }
  }
  if (urlParams.has("run")) {
    const urls = urlParams.getAll("run");
    for (let url of urls) {
      try {
        Snackbar.show({
          text: "Fetching and running macro from: " + url,
          pos: "bottom-left"
        });
        // convert to raw if we can
        const tmp = await githubUrlRaw(url, ".ijm");
        url = tmp || url;
        const blob = await fetch(url).then(r => r.blob());
        const macro = await new Response(blob).text();
        await imagej.runMacro(macro, "");
      } catch (e) {
        Snackbar.show({
          text: "Failed to run macro: " + e.toString(),
          pos: "bottom-left"
        });
      }
    }
  }
}

window.onImageJInitialized = async () => {
  const _cheerpjCloseAsync = window.cheerpjCloseAsync;
  window.cheerpjCloseAsync = function(fds, fd, p) {
    const fdObj = fds[fd];
    const fileData = fdObj.fileData;
    const tmp = fileData.path.split("/");
    const filename = tmp[tmp.length - 1];
    if (downloadQueue[filename]) {
      delete downloadQueue[fileData.path];
      downloadBytesFile(fileData.chunks, filename);
      _cheerpjCloseAsync.apply(null, arguments);
      // remove the file after downloading
      window.ij.removeFile("/files/" + filename);
      loader.style.display = "none";
    } else {
      _cheerpjCloseAsync.apply(null, arguments);
    }
  };
  const imagej = {
    run: await cjResolveCall("ij.IJ", "run", [
      "java.lang.String",
      "java.lang.String"
    ]),
    showStatus: await cjResolveCall("ij.IJ", "showStatus", [
      "java.lang.String"
    ]),
    showMessage: await cjResolveCall("ij.IJ", "showMessage", [
      "java.lang.String",
      "java.lang.String"
    ]),
    runPlugIn: await cjResolveCall("ij.IJ", "runPlugIn", [
      "java.lang.String",
      "java.lang.String"
    ]),
    runMacro: await cjResolveCall("ij.IJ", "runMacro", [
      "java.lang.String",
      "java.lang.String"
    ]),
    installMacro: await cjResolveCall("ij.IJ", "installMacro", [
      "java.lang.String"
    ]),
    installTool: await cjResolveCall("ij.IJ", "installTool", [
      "java.lang.String"
    ]),
    open: await cjResolveCall("ij.IJ", "open", ["java.lang.String"]),
    installPlugin: await cjResolveCall("ij.Menus", "installPlugin", null),
    getPlugins: await cjResolveCall("ij.Menus", "getPlugins", []),
    getPlugInsPath: await cjResolveCall("ij.Menus", "getPlugInsPath", []),
    getImage: await cjResolveCall("ij.IJ", "getImage", []),
    save: await cjResolveCall("ij.IJ", "save", [
      "ij.ImagePlus",
      "java.lang.String"
    ]),
    saveAsBytes: await cjResolveCall("ij.IJ", "saveAsBytes", [
      "ij.ImagePlus",
      "java.lang.String"
    ]),
    getPixels: await cjResolveCall("ij.IJ", "getPixels", [
      "ij.ImagePlus",
      "int",
      "int",
      "int"
    ]),
    selectWindow: await cjResolveCall("ij.IJ", "selectWindow", [
      "java.lang.String"
    ]),
    getDimensions: await cjResolveCall("ij.IJ", "getDimensions", [
      "ij.ImagePlus"
    ]),
    getString: await cjResolveCall("ij.IJ", "getString", [
      "java.lang.String",
      "java.lang.String"
    ]),
    listDir: await cjResolveCall("ij.IJ", "listDir", ["java.lang.String"]),
    removeFile: await cjResolveCall("ij.IJ", "removeFile", [
      "java.lang.String"
    ]),
    openAsBytes: await cjResolveCall("ij.IJ", "openAsBytes", [
      "java.lang.String"
    ]),
    saveBytes: await cjResolveCall("ij.IJ", "saveBytes", null)
    // updateImageJMenus: await cjResolveCall("ij.Menus", "updateImageJMenus", null),
    // getPrefsDir: await cjResolveCall("ij.Prefs", "getPrefsDir", null),
  };
  window.ij = imagej;
  setupDragAndDrop(imagej);
  fixMenu(imagej);
  fixTouch();

  function setAPI(core_api) {
    setupImJoyAPI(
      core_api,
      imagej,
      loader,
      getImageData,
      javaBytesToArrayBuffer,
      saveImage,
      openImage,
      addMenuItem
    );
  }
  // if inside an iframe, setup ImJoy
  if (window.self !== window.top) {
    setAPI(null);
  } else {
    setupImJoyApp(setAPI);
  }

  processUrlParameters(imagej);

  loader.style.display = "none";

  setTimeout(() => {
    localStorage.setItem(
      "cheepjPreload",
      JSON.stringify(cjGetRuntimeResources())
    );
  }, 1000);
  console.timeEnd("Loading ImageJ.JS");
};
console.time("Loading ImageJ.JS");
startImageJ();
