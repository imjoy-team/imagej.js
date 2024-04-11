import { setupImJoyApp } from "./imjoyApp.js";
import { setupImJoyAPI } from "./imjoyAPI.js";
import { githubUrlRaw, convertZenodoFileUrl } from "./utils.js";
import LZString from "lz-string";
import Snackbar from "node-snackbar/dist/snackbar";
import "node-snackbar/dist/snackbar.css";
import A11yDialog from "a11y-dialog";
import { polyfill } from "mobile-drag-drop";
import QRCode from "qrcode";
import { loadZarrImage } from "./zarrUtils";
import { version } from "../package.json";

// optional import of scroll behaviour
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

window.imagejPatcher = {};

const ua = window.navigator.userAgent.toLowerCase();
const isiPad =
  ua.indexOf("ipad") > -1 ||
  (ua.indexOf("macintosh") > -1 && "ontouchend" in document);
const usePolyfill = polyfill({
  forceApply: isiPad, // force apply for ipad
  dragImageTranslateOverride:
    scrollBehaviourDragImageTranslateOverride || isiPad
});

// https://github.com/timruffles/mobile-drag-drop/issues/152
if (usePolyfill) {
  document.addEventListener("dragenter", event => event.preventDefault());
  window.addEventListener("touchmove", () => {}, { passive: false });
}

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
window.onEditorResized = () => {};

window.createImJoyCodeEditor = async (name, type, arg) => {
  await window.callPlugin("ImageJScriptEditor", "run", {
    data: { arg, name, type }
  });
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

window.onEditorClose = name => {
  if (sharingScript && name === sharingScript.name) {
    sharingScript = null;
    insertUrlParam("open", null);
  }
};
window.onEditorTextChanged = debounce((name, content) => {
  // update the sharing url
  if (sharingScript && name === sharingScript.name) {
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify({ name, content })
    );
    insertUrlParam("open", compressed);
  }
}, 1000);

function insertUrlParam(key, value) {
  if (history.pushState) {
    let searchParams = new URLSearchParams(window.location.search);
    if (value) searchParams.set(key, value);
    else searchParams.delete(key);
    const query = searchParams.toString();
    let newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      (query.length > 0 ? "?" + query : "");
    window.history.pushState({ path: newurl }, "", newurl);
    return window.location.href;
  }
}

let sharingScript = null;
window.shareViaQRCode = (name, content) => {
  const compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify({ name, content })
  );
  const url = insertUrlParam("open", compressed);
  sharingScript = { name, content };
  QRCode.toCanvas(url, { errorCorrectionLevel: "L" }, function(err, canvas) {
    if (err) {
      alert(err.toString());
      return;
    }
    canvas.toBlob(function(blob) {
      const file = new File([blob], "QRCode_" + name.split(".")[0] + ".png", {
        type: "text/plain"
      });
      mountFile(file).then(filepath => {
        ij.open(filepath).finally(() => {
          cheerpjRemoveStringFile(filepath);
        });
      });
    });
  });
};

window.shareViaURL = (name, content) => {
  const compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify({ name, content })
  );
  insertUrlParam("open", compressed);
  sharingScript = { name, content };
  let message = `The script is encoded as URL, you can now copy and share the URL in the address bar!`;
  if (compressed.length > 8192 - 100) {
    message =
      message +
      "\nWARNING: the generated URL might be too long for some browser, you may want to share it via Github or Gist instead.";
  }
  alert(message);
};

window.shareViaGithub = () => {
  window.open(
    "https://github.com/imjoy-team/imagej.js#sharing-images-macro-or-plugins-with-url-parameters"
  );
};

// setup a hook for fixing mobile touch event
const _createElement = document.createElement;

let lastMenus = [];
function switchMenu(menu) {
  if (menu) {
    menu.classList.add("active");
    if (lastMenus.length > 0) {
      let i = lastMenus.length;
      while (i--) {
        if (!lastMenus[i].contains(menu)) {
          lastMenus[i].classList.remove("active");
          lastMenus.splice(i, 1);
        }
      }
    }
    lastMenus.push(menu);
  } else {
    if (lastMenus.length > 0) {
      for (let m of lastMenus) {
        m.classList.remove("active");
      }
      lastMenus = [];
    }
  }
}

function touchClick(ev) {
  ev.target.focus();
  ev.target.click();
  ev.preventDefault();
  if (["UL", "LI", "BUTTON", "INPUT", "A"].includes(ev.target.tagName)) {
    ev.stopPropagation();
    switchMenu(null);
  } else if (ev.target.tagName === "LABEL") {
    const menu = ev.target.parentNode.parentNode;
    if (menu && menu.classList.contains("subMenuItem")) {
      switchMenu(menu);
    } else {
      switchMenu(null);
    }
    ev.stopPropagation();
  } else {
    switchMenu(null);
  }
}

function replaceTextArea(elm, fileName) {
  let mode;
  if (fileName.endsWith(".imjoy.html")) {
    mode = {
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
    };
  } else if (
    fileName.endsWith(".ijm") ||
    fileName.endsWith(".js") ||
    fileName.endsWith(".txt")
  ) {
    mode = {
      name: "javascript"
    };
  } else if (fileName.endsWith(".py")) {
    mode = {
      name: "python"
    };
  } else {
    return;
  }
  const editorDiv = _createElement.call(document, "DIV");
  editorDiv.setAttribute("style", elm.getAttribute("style"));
  editorDiv.style["z-index"] = 0;
  const myCodeMirror = CodeMirror(editorDiv, {
    value: elm.value,
    mode,
    lineNumbers: false,
    matchBrackets: true
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
}

document.createElement = function(type) {
  const elm = _createElement.call(document, type);
  elm.addEventListener("touchstart", touchClick, { passive: true });
  if (elm.nodeName === "TEXTAREA") {
    function tryReplace() {
      if (!document.contains(elm)) {
        setTimeout(tryReplace, 200);
        return;
      }
      // only apply to textarea in a window
      if (
        elm.parentNode.nextSibling &&
        elm.parentNode.nextSibling.classList[0] === "titleBar"
      ) {
        if (elm.style.display === "none") setTimeout(tryReplace, 200);
        else
          replaceTextArea(
            elm,
            elm.parentNode.nextSibling.children[0].innerText
          );
      }
    }
    setTimeout(tryReplace, 200);
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

window.startImageJ = async function () {
  updateViewPort();
  window.addEventListener("resize", updateViewPort);
  fixHeight();
  fixStyle();
  console.time("Loading ImageJ.JS");
  loader.style.display = "block";
  let preload;
  try {
    preload = localStorage.getItem("cheepjPreload");
  } catch (e) {
    console.error(e);
  }
  if (preload) preload = JSON.parse(preload);
  else preload = [];
  cheerpjInit({
    preloadResources: preload,
    enableInputMethods: true,
    clipboardMode: "java",
    enablePreciseClassLoaders: true,
    disableErrorReporting: true,
    javaProperties: [
      "java.protocol.handler.pkgs=com.leaningtech.handlers",
      "user.dir=/files",
      "plugins.dir=/app/ij153/plugins"
    ]
  });
  const appContainer = document.getElementById("imagej-container");
  const elm = cheerpjCreateDisplay(-1, -1, appContainer);
  const _addEL = elm.addEventListener;
  elm.addEventListener = (event, handler, options) => {
    if (
      event === "dblclick" ||
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
            e.target.getAttribute("role") !== "presentation" &&
            (!window._imjoy_menu_element ||
              !window._imjoy_menu_element.contains(e.target))
          ) {
            handler.apply(null, [e]);
          } else {
            switchMenu(null);
          }
        }
      ]);
    } else if (event.startsWith("drag")) {
      _addEL.apply(elm, [
        event,
        e => {
          // fix for mobile
          if (e.dataTransfer && !e.dataTransfer.items)
            e.dataTransfer.items = [];
          handler.apply(null, [e]);
        },
        options
      ]);
    } else if (event.startsWith("touch")) {
      _addEL.apply(elm, [
        event,
        e => {
          // skip for menubar
          if (
            !e.target.classList.contains("titleBar") &&
            !(
              e.target.parentNode &&
              e.target.parentNode.classList.contains("titleBar")
            )
          ) {
            handler.apply(null, [e]);
          } else if (
            e.target.parentNode &&
            e.target.parentNode.classList.contains("titleBar")
          ) {
            e.target.style.display = "none";
            setTimeout(() => {
              e.target.style.display = "inline-block";
            }, 2000);
            handler.apply(null, [e]);
          }
        },
        options
      ]);
    } else {
      _addEL.apply(elm, [event, handler, options]);
    }
  };
  cheerpjRunMain("ij.ImageJ", "/app/ij153/ij-1.53m.jar");
}

async function listFiles(imagej, path) {
  const files = await imagej.listDir(path);
  return files.map(cjStringJavaToJs);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mountFile(file) {
  const filepath = "/str/" + file.name;
  const bytes = await readFile(file);
  cheerpjAddStringFile(filepath, bytes);
  await sleep(1);
  return filepath;
}

async function showImage(img, options) {
  const imagej = window.ij;
  options = options || {};
  options.name = options.name || "tmp";
  const filepath = "/str/" + options.name;
  if (img instanceof ArrayBuffer) {
    cheerpjAddStringFile(filepath, new Uint8Array(img));
    await sleep(1);
    return await openImage(imagej, filepath);
  } else {
    const formats = {
      uint8: "8-bit",
      uint16: "16-bit Unsigned",
      int16: "16-bit Signed",
      uint32: "32-bit Unsigned",
      int32: "32-bit Signed",
      float32: "32-bit Real",
      flaot64: "64-bit Real"
    };
    cheerpjAddStringFile(filepath, new Uint8Array(img._rvalue));
    await sleep(1);
    let format = formats[img._rdtype];

    if (img._rshape.length === 3) {
      let number = img._rshape[2];
      if (img._rshape[2] === 3 && img._rdtype === "uint8") {
        format = "24-bit RGB";
        number = 1;
        return await imagej.run(
          "Raw...",
          `open=${filepath} image=[${format}] width=${img._rshape[1]} height=${img._rshape[0]} number=${number} little-endian`
        );
      }
      else{
        return await imagej.run(
          "Raw...",
          `open=${filepath} image=[${format}] width=${img._rshape[2]} height=${img._rshape[1]} number=${img._rshape[0]} little-endian`
        );
      }
    } else if (img._rshape.length === 4) {
      if (img._rshape[3] === 3) {
        format = "24-bit RGB";
      } else {
        if (img._rshape[3] !== 1) {
          throw "channel dimension (last) can only be 1 or 3";
        }
      }
      return await imagej.run(
        "Raw...",
        `open=${filepath} image=[${format}] width=${img._rshape[2]} height=${img._rshape[1]} number=${img._rshape[0]} little-endian`
      );
    } else if (img._rshape.length === 2) {
      return await imagej.run(
        "Raw...",
        `open=${filepath} image=[${format}] width=${img._rshape[1]} height=${img._rshape[0]} little-endian`
      );
    }
  }
}

const typeMapping = {
  uint8: 0, //GRAY8 8-bit grayscale (unsigned)
  uint16: 1, //GRAY16 16-bit grayscale (unsigned)
  float32: 2 //	GRAY32 32-bit floating-point grayscale
};

//convert numpy array to ImagePlus
async function ndarrayToImagePlus(array) {
  if (!typeMapping[array._rdtype]) {
    if (promise)
      await cjCall(
        promise,
        "reject",
        "unsupported array dtype: " +
          array._rdtype +
          ", valid dtypes: uint8, uint16, flat32"
      );
    else {
      console.error(
        "unsupported array dtype: " +
          array._rdtype +
          ", valid dtypes: uint8, uint16, flat32"
      );
    }
  }
  const shape = Int16Array.from([1, 1, 1, 1, 1]);
  if (array._rshape.length === 2) {
    shape[3] = array._rshape[0]; // height
    shape[4] = array._rshape[1]; // width
  } else if (array._rshape.length === 3) {
    shape[2] = array._rshape[0]; // channel
    shape[3] = array._rshape[1]; // height
    shape[4] = array._rshape[2]; // width
  } else if (array._rshape.length === 4) {
    shape[1] = array._rshape[0]; // stack
    shape[2] = array._rshape[1]; // channel
    shape[3] = array._rshape[2]; // height
    shape[4] = array._rshape[3]; // width
  } else if (array._rshape.length === 5) {
    shape[0] = array._rshape[0]; // frame
    shape[1] = array._rshape[1]; // stack
    shape[2] = array._rshape[2]; // channel
    shape[3] = array._rshape[3]; // height
    shape[4] = array._rshape[4]; // width
  } else {
    if (promise)
      await cjCall(
        promise,
        "reject",
        "unsupported array shape: " +
          array._rshape +
          ", allowed dimensions: 2-5"
      );
    else {
      console.error(
        "unsupported array shape: " +
          array._rshape +
          ", allowed dimensions: 2-5"
      );
    }
  }
  const ip = await ij.createImagePlus(
    cjTypedArrayToJava(new Uint8Array(array._rvalue)),
    typeMapping[array._rdtype],
    cjTypedArrayToJava(shape),
    array.title || "untitiled image"
  );
  return ip;
}
// Note: 'channel', 'slice' and 'frame' are one-based indexes
async function getImageData(imagej, imp, all, channel, slice, frame) {
  // const name = cjStringJavaToJs(await cjCall(imp, "getTitle"));
  const width = await cjCall(imp, "getWidth");
  const height = await cjCall(imp, "getHeight");
  const channels = await cjCall(imp, "getNChannels");
  const type = await cjCall(imp, "getType");
  const typeMapping = {
    0: "uint8", //GRAY8 8-bit grayscale (unsigned)
    1: "uint16", //GRAY16 16-bit grayscale (unsigned)
    2: "float32", //	GRAY32 32-bit floating-point grayscale
    3: "uint8", // COLOR_256 8-bit indexed color
    4: "uint8" // COLOR_RGB 24-bit RGB color
  };
  const bytesPerPixelMapping = {
    0: 1, //GRAY8 8-bit grayscale (unsigned)
    1: 2, //GRAY16 16-bit grayscale (unsigned)
    2: 4, //	GRAY32 32-bit floating-point grayscale
    3: 1, // COLOR_256 8-bit indexed color
    4: 1 // COLOR_RGB 24-bit RGB color
  };

  if (all) {
    const slices = await cjCall(imp, "getNSlices");
    const frames = await cjCall(imp, "getNFrames");
    const bytes = javaBytesToArrayBuffer(await imagej.saveAsBytes(imp, "raw"));
    const shape = [height.value0, width.value0, channels.value0];
    // calculate the actual channel number, e.g. for RGB image
    shape[2] =
      bytes.byteLength /
      (shape[0] * shape[1] * (slices.value0 || 1) * (frames.value0 || 1)) /
      bytesPerPixelMapping[type.value0];
    if (slices.value0 && slices.value0 !== 1) {
      // insert to the begining
      shape.splice(0, 0, slices.value0);
    }
    if (frames.value0 && frames.value0 !== 1) {
      // insert to the begining
      shape.splice(0, 0, frames.value0);
    }
    return {
      type: typeMapping[type.value0],
      shape: shape,
      bytes
    };
  } else {
    if (channel === undefined) channel = 0; // 0 means current channel
    if (slice === undefined) slice = 0; // 0 means current slice
    if (frame === undefined) frame = 0; // 0 means current frame
    const bytes = javaBytesToArrayBuffer(
      await imagej.getPixels(imp, channel, slice, frame)
    );
    const shape = [height.value0, width.value0, channels.value0];
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

async function fixSetScaleWindowSize() {
  // Get the div element
  const myDiv = document.querySelector("#cheerpjDisplay");

  // Create a new instance of the MutationObserver
  const observer = new MutationObserver(mutations => {
    // Check each mutation for added nodes
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        // If the added node is a child element of the div, do something
        if (node.parentNode === myDiv) {
          if (node.querySelector(".titleBar").textContent === "Set Scale✖") {
            node.querySelector("div").style.marginTop = "14px";
            node.style.height = `${parseInt(node.style.height) + 40}px`;
          }
        }
      });
    });
  });

  // Configure the observer to watch for additions of child nodes
  const config = { childList: true };

  // Start observing the div element for changes
  observer.observe(myDiv, config);
}

async function fixZOrder() {
  const ijWindow = document.querySelector(
    "#cheerpjDisplay>.window:nth-child(2)"
  );

  ijWindow.addEventListener("mouseenter", () => {
    ijWindow.classList.add("always-top");
  });
  ijWindow.addEventListener("mouseleave", () => {
    ijWindow.classList.remove("always-top");
  });
  const menuBar = ijWindow.querySelector(".menuBar");
  menuBar.addEventListener("mousedown", () => {
    ijWindow.classList.add("always-top");
  });
}

async function fixMenu() {
  const removes = [
    "Open Recent",
    "Install... ",
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
  }

  addMenuItem({
    label: "Load NGFF (Experimental)",
    group: "Plugins",
    async callback() {
      const url = prompt(
        "Please type a OME-Zarr/NGFF image URL",
        "https://uk1s3.embassy.ebi.ac.uk/idr/zarr/v0.1/6001237.zarr"
      );
      await ij.viewZarr({ source: url });
    }
  });

  addMenuItem({
    label: "ImJoy Code Editor",
    group: "Plugins",
    position: "3.1",
    async callback() {
      await window.callPlugin(
        "ImageJScriptEditor",
        "run",
        {
          data: { name: "macro.ijm" }
        },
        null
      );
    }
  });
}

function setupDragDropPaste(imagej) {
  const appContainer = document.getElementById("imagej-container");
  const dragOverlay = document.getElementById("drag-overlay");
  function processDataTransfer(items) {
    if (!items) return;
    const processed = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("event/")) continue;
      if (
        item.kind === "string" &&
        ["text/plain", "text/uri-list"].includes(item.type)
      ) {
        item.getAsString(function(data) {
          if (processed.includes(data)) return;
          if (data.startsWith("http")) {
            loadContentFromUrl(imagej, data);
            processed.push(data);
          } else {
            const blob = new Blob([data]);
            const file = new File([blob], "clipboard.txt", {
              type: "text/plain"
            });
            mountFile(file).then(filepath => {
              imagej.open(filepath).finally(() => {
                cheerpjRemoveStringFile(filepath);
              });
            });
          }
        });
      } else if (item.kind === "file") {
        const file = item.getAsFile();
        if (file.name.endsWith(".jar") || file.name.endsWith(".jar.js")) {
          saveFileToFS(imagej, file);
        } else {
          mountFile(file).then(filepath => {
            imagej.open(filepath).finally(() => {
              cheerpjRemoveStringFile(filepath);
            });
          });
        }
      }
    }
  }
  appContainer.addEventListener(
    "dragenter",
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.types.includes("Files")) {
        dragOverlay.style.display = "block";
      }
    },
    false
  );
  appContainer.addEventListener(
    "dragover",
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.types.includes("Files")) {
        dragOverlay.style.display = "block";
      }
    },
    false
  );
  appContainer.addEventListener(
    "dragleave",
    e => {
      e.preventDefault();
      e.stopPropagation();
      dragOverlay.style.display = "none";
    },
    false
  );
  appContainer.addEventListener(
    "drop",
    e => {
      e.preventDefault();
      e.stopPropagation();
      processDataTransfer(e.dataTransfer.items);
      dragOverlay.style.display = "none";
    },
    false
  );

  const cdisplay = document.getElementById("cheerpjDisplay");
  document.body.addEventListener("paste", event => {
    if (
      event.target === cdisplay.firstChild ||
      !cdisplay.contains(event.target)
    ) {
      event.preventDefault();
      event.stopPropagation();
      const paste = event.clipboardData || window.clipboardData;
      processDataTransfer(paste.items);
    }
  });

  window.pasteFromSystem = () => {
    navigator.clipboard
      .read()
      .then(async clipboardItems => {
        for (const clipboardItem of clipboardItems) {
          try {
            for (const type of clipboardItem.types) {
              const blob = await clipboardItem.getType(type);
              const file = new File(
                [blob],
                blob.name ||
                  "clipboard" + (blob.type === "text/plain" ? ".txt" : ""),
                { type: blob.type || type }
              );
              mountFile(file).then(filepath => {
                imagej.open(filepath).finally(() => {
                  cheerpjRemoveStringFile(filepath);
                });
              });
            }
          } catch (e) {
            console.error(e, e.message);
          }
        }
      })
      .catch(e => {
        window.ij.showStatus("Failed to paste from system: " + e.toString());
      });
  };

  window.copyToSystem = async imp => {
    try {
      await window.ij.showStatus("Copying to system clipboard...");
      loader.style.display = "block";
      const name = cjStringJavaToJs(await cjCall(imp, "getTitle"));
      const blob = new Blob([
        javaBytesToArrayBuffer(await window.ij.saveAsBytes(imp, "png"))
      ]);
      const file = new File([blob], name, { type: "image/png" });
      let data = [new ClipboardItem({ [file.type]: file })];

      await navigator.clipboard.write(data);
      await window.ij.showStatus("Image copied to system clipboard");
    } catch (e) {
      await window.ij.showStatus("Failed to copy, error: " + e.toString());
    } finally {
      loader.style.display = "none";
    }
  };
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

  let targetMenu = document.querySelector(
    `#cheerpjDisplay>.window>div.menuBar>.menu>.menuItem:nth-child(${index})>ul`
  );

  if (config.position) {
    if (typeof config.position === "number") {
      for (let ch of targetMenu.children) {
        if (ch.children[0].innerHTML === config.label) {
          targetMenu.removeChild(ch);
        }
      }
      targetMenu.insertBefore(newMenu, targetMenu.children[config.position]);
    } else {
      const [p1, p2] = config.position.split(".");
      const menu = targetMenu.children[parseInt(p1)];
      const subMenu = menu.querySelector(
        `ul>.menuItem:nth-child(${parseInt(p2)})`
      );
      targetMenu = menu.querySelector("ul");
      for (let ch of targetMenu.children) {
        if (ch.children[0].innerHTML === config.label) {
          targetMenu.removeChild(ch);
        }
      }
      targetMenu.insertBefore(newMenu, subMenu);
    }
  } else {
    for (let ch of targetMenu.children) {
      if (ch.children[0].innerHTML === config.label) {
        targetMenu.removeChild(ch);
      }
    }
    targetMenu.appendChild(newMenu);
  }
}

window.registerServiceWorker = function() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("/service-worker.js").then(
        function(registration) {
          // Registration was successful
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );

          const currentVersion = localStorage.getItem("service-worker-version");
          if (!currentVersion || currentVersion != version) {
            console.log("Upgrading ServiceWorker to " + version);
            registration.update();
            localStorage.setItem("service-worker-version", version);
          }
        },
        function(err) {
          // registration failed :(
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
}

function isIpadOS() {
  return (
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 0) ||
    navigator.platform === "iPad"
  );
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

function getCSSRule(search) {
  return [].map
    .call(document.styleSheets, function(item) {
      return [].slice.call(item.cssRules);
    })
    .reduce(function(a, b) {
      return b.concat(a);
    })
    .filter(function(rule) {
      return (
        rule.cssText.lastIndexOf(search) === rule.cssText.length - search.length
      );
    })[0];
}

function addMinimizeButton() {
  const titleBar = document.querySelector(".titleBar");
  const placeholder = document.getElementById("ijWindowPlaceholder");
  const a = document.createElement("A");
  a.classList.add("controls");
  a.classList.add("closeButton");
  a.innerHTML = "-";
  titleBar.appendChild(a);
  placeholder.style.visibility = "hidden";
  a.onclick = () => {
    titleBar.parentNode.style.visibility = "hidden";
    placeholder.style.visibility = "visible";
    placeholder.onclick = () => {
      titleBar.parentNode.style.visibility = "visible";
      placeholder.style.visibility = "hidden";
    };
  };
}

function fixStyle() {
  if (iOS() && !isIpadOS()) {
    // Create our stylesheet
    var style = document.createElement("style");
    style.innerHTML = `.titleBar>.controls {
      margin-top: -5px;
      color: white !important;
    }
    .dialog-ctrl{
      margin-top: -14px!important;
    }
    #imjoy-menu {
      margin-top: -2px;
    }
    `;
    // Get the first script tag
    var ref = document.querySelector("script");

    // Insert our new styles before the first script tag
    ref.parentNode.insertBefore(style, ref);
  } else if (isFirefox) {
    // Create our stylesheet
    var style = document.createElement("style");
    style.innerHTML = `
    #imjoy-menu {
      margin-top: 2px;
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
  const menus = document.querySelectorAll(".subMenuItem");
  for (let menu of menus) {
    menu.removeEventListener("touchstart", touchClick);
  }
}

function getUrlExtension(url) {
  url = new URL(url);
  const tmp = url.pathname.split("/");
  url = tmp[tmp.length - 1];
  if (!url) return null;
  return url
    .split(/[#?]/)[0]
    .split(".")
    .pop()
    .trim();
}

async function loadContentFromUrl(imagej, url) {
  try {
    Snackbar.show({
      text: "Opening " + url,
      pos: "bottom-left"
    });
    if (url.split("?")[0].endsWith(".zarr")) {
      await ij.viewZarr({ source: url });
      Snackbar.show({
        text: "Successfully opened " + url,
        pos: "bottom-left"
      });
      return;
    }
    // convert to raw if we can
    else if (url.includes("//zenodo.org/record")) {
      url = await convertZenodoFileUrl(url);
    } else {
      const tmp =
        (await githubUrlRaw(url, ".ijm")) ||
        (await githubUrlRaw(url, ".imjoy.html"));
      url = tmp || url;
    }
    // if the url contains no file extension,
    // then try to guess the file type based on Content-Type header
    if (!getUrlExtension(url)) {
      const response = await fetch(url);
      const blob = await response.blob();
      const type = response.headers.get("Content-Type");
      let format;
      if (type === "image/jpeg") {
        format = ".jpg";
      } else if (type === "image/png") {
        format = ".jpg";
      } else if (type === "image/gif") {
        format = ".gif";
      } else {
        throw new Error("Unsupported file type: " + type);
      }
      const file = new File([blob], "image" + format, {
        type
      });
      mountFile(file).then(filepath => {
        imagej.open(filepath).finally(() => {
          cheerpjRemoveStringFile(filepath);
        });
      });
    } else {
      await imagej.open(url);
    }
    Snackbar.show({
      text: "Successfully opened " + url,
      pos: "bottom-left"
    });
  } catch (e) {
    console.error(e);
    Snackbar.show({
      text: "Failed to open " + url,
      pos: "bottom-left"
    });
  }
}

async function processUrlParameters(imagej) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("install-tool")) {
    const urls = urlParams.getAll("install-tool");
    for (let url of urls) {
      let script;
      if (url.startsWith("http")) {
        if (url.includes("//zenodo.org/record")) {
          url = await convertZenodoFileUrl(url);
        } else {
          const tmp =
            (await githubUrlRaw(url, ".ijm")) ||
            (await githubUrlRaw(url, ".txt"));
          url = tmp || url;
        }
        const response = await fetch(url);
        if (!response.ok) {
          alert("Failed to install tool from url:" + url);
          return;
        }
        script = await response.text();
      } else {
        const decompressed = LZString.decompressFromEncodedURIComponent(url);
        if (decompressed) {
          script = JSON.parse(decompressed);
        } else {
          console.error("Failed to decompress url: ", url);
        }
      }
      if (script) await window.ij.installTool(script);
      else alert("No script found");
    }
  }
  if (urlParams.has("install-macro")) {
    const urls = urlParams.getAll("install-macro");
    for (let url of urls) {
      let script;
      if (url.startsWith("http")) {
        if (url.includes("//zenodo.org/record")) {
          url = await convertZenodoFileUrl(url);
        } else {
          const tmp = await githubUrlRaw(url, ".ijm");
          url = tmp || url;
        }
        const response = await fetch(url);
        if (!response.ok) {
          alert("Failed to install macro from url:" + url);
          return;
        }
        script = await response.text();
      } else {
        const decompressed = LZString.decompressFromEncodedURIComponent(url);
        if (decompressed) {
          script = JSON.parse(decompressed);
        } else {
          console.error("Failed to decompress url: ", url);
        }
      }
      if (script) await window.ij.installMacro(script);
      else alert("No script found");
    }
  }
  if (urlParams.has("open")) {
    const urls = urlParams.getAll("open");
    for (let url of urls) {
      if (url.startsWith("http")) await loadContentFromUrl(imagej, url);
      else {
        const decompressed = LZString.decompressFromEncodedURIComponent(url);
        if (decompressed) {
          const data = JSON.parse(decompressed);
          sharingScript = data;
          const blob = new Blob([data.content]);
          const file = new File([blob], data.name, {
            type: "text/plain"
          });
          mountFile(file).then(filepath => {
            imagej.open(filepath).finally(() => {
              cheerpjRemoveStringFile(filepath);
            });
          });
          Snackbar.show({
            text: "Script loaded from URL",
            pos: "bottom-left"
          });
        } else {
          console.error("Failed to decompress url: ", url);
        }
      }
    }
  }
  if (urlParams.has("run")) {
    const urls = urlParams.getAll("run");
    for (let url of urls) {
      try {
        if (url.startsWith("http")) {
          Snackbar.show({
            text: "Fetching and running macro from: " + url,
            pos: "bottom-left"
          });
          if (url.includes("//zenodo.org/record")) {
            url = await convertZenodoFileUrl(url);
            if (!url.endsWith(".ijm")) throw new Error("not an imagej macro");
          } else {
            // convert to raw if we can
            const tmp = await githubUrlRaw(url, ".ijm");
            url = tmp || url;
          }

          const blob = await fetch(url).then(r => r.blob());
          const macro = await new Response(blob).text();
          await imagej.runMacroAsync(macro, "");
        } else {
          const decompressed = LZString.decompressFromEncodedURIComponent(url);
          if (decompressed) {
            const data = JSON.parse(decompressed);
            await imagej.runMacroAsync(data.content, "");
            Snackbar.show({
              text: "Executed script from URL",
              pos: "bottom-left"
            });
          } else {
            console.error("Failed to decompress url: ", url);
          }
        }
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
  document.getElementById("site-tips-container").style.display = "none";
  addMinimizeButton();
  const _cheerpjCloseAsync = window.cheerpjCloseAsync;
  window.cheerpjCloseAsync = function(fds, fd, p) {
    const fdObj = fds[fd];
    const fileData = fdObj.fileData;
    const tmp = fileData.path.split("/");
    const filename = tmp[tmp.length - 1];
    if (downloadQueue[filename]) {
      delete downloadQueue[filename];
      //TODO: support file system other than indexeddb
      //TODO: support streaming for large files
      const chunks = [];
      let byteCount = 0;
      // copy the chunks
      for (let c of fileData.chunks) {
        if (byteCount + c.length > fileData.length) {
          chunks.push(c.slice(0, fileData.length - byteCount));
          break;
        } else chunks.push(c);
        byteCount += c.length;
      }
      _cheerpjCloseAsync.apply(null, arguments);
      downloadBytesFile(chunks, filename);
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
    showProgress: await cjResolveCall("ij.IJ", "showProgress", ["double"]),
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
    createImagePlus: await cjResolveCall("ij.IJ", "createImagePlus", null),
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
    createPlugInFrame: await cjResolveCall("ij.IJ", "createPlugInFrame", [
      "java.lang.String",
      "int",
      "int",
      "int",
      "int"
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
    saveBytes: await cjResolveCall("ij.IJ", "saveBytes", null),
    createJSVirtualStack: await cjResolveCall(
      "ij.IJ",
      "createJSVirtualStack",
      null
    ),
    // updateImageJMenus: await cjResolveCall("ij.Menus", "updateImageJMenus", null),
    // getPrefsDir: await cjResolveCall("ij.Prefs", "getPrefsDir", null),
    getImageData,
    showImage,
    ndarrayToImagePlus
  };

  imagej.runMacroAsync = function(macro, args) {
    return new Promise((resolve, reject) => {
      window.onMacroResolve = resolve;
      // TODO: handle reject
      window.onMacroReject = reject;
      // fix nih sample url
      macro = macro.replace(/https:\/\/imagej.nih.gov\/ij\/images\//g, 'https://imagej.net/images/')
      imagej.runMacro(macro, args);
    });
  };

  imagej.openVirtualStack = img => {
    // img should contain the following properties:
    // name, dtype, width, height, nSlice, and a getSlice(index) function
    return new Promise(async (resolve, reject) => {
      try {
        const key = `${Date.now()}`;
        allVirtualStacks[key] = img;
        const typeMapping = {
          uint8: 0, //GRAY8 8-bit grayscale (unsigned)
          uint16: 1, //GRAY16 16-bit grayscale (unsigned)
          float32: 2 //	GRAY32 32-bit floating-point grayscale
        };
        if (typeMapping[img.dtype] === undefined) {
          throw new Error("Unsupported image data type: " + img.dtype);
        }
        await imagej.createJSVirtualStack(
          key,
          img.width,
          img.height,
          img.nSlice,
          typeMapping[img.dtype],
          img.name
        );
        img._resolve = resolve;
      } catch (e) {
        reject(e);
      }
    });
  };

  imagej.closeVirtualStack = async key => {
    delete allVirtualStacks[key];
  };

  imagej.viewZarr = async config => {
    config = config || {};
    const img = await loadZarrImage(config);
    const vsid = await imagej.openVirtualStack(img);
    if (img.sizeT > 1 || img.sizeZ > 1)
      await ij.runMacro(
        `run("Stack to Hyperstack...", "order=xyzct channels=${img.sizeC} slices=${img.sizeZ} frames=${img.sizeT} display=Grayscale");`
      );
    return vsid;
  };

  window.ij = imagej;
  setupDragDropPaste(imagej);
  fixSetScaleWindowSize();
  fixMenu();
  fixZOrder();
  fixTouch();

  function setAPI(core_api) {
    setupImJoyAPI(
      core_api,
      imagej,
      loader,
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
    await setupImJoyApp(setAPI);
    const titleBar = document.querySelector(".titleBar");
    const elem = document.getElementById("imjoy-menu");
    window._imjoy_menu_element = elem;
    titleBar.parentNode.insertBefore(elem, titleBar.nextSibling);
  }

  processUrlParameters(imagej);

  loader.style.display = "none";

  setTimeout(() => {
    localStorage.setItem("cheepjPreload", cjGetRuntimeResources());
  }, 1000);
  console.timeEnd("Loading ImageJ.JS");
};

const allVirtualStacks = {};

window.getVirtualStackSlice = async (key, index, promise) => {
  if (!allVirtualStacks[key]) {
    throw new Error("virtual stack not found: " + key);
  }
  allVirtualStacks[key]
    .getSlice(index - 1) // imagej uses 1-based indexes
    .then(data => {
      if (data instanceof ArrayBuffer) data = new Uint8Array(data);
      cjCall(promise, "resolve", cjTypedArrayToJava(data));
    })
    .catch(e => {
      cjCall(promise, "reject", `${e}`);
    });
};

window.onJSVirtualStackReady = async (key, imp) => {
  console.log("virtual stack is ready", key, imp);
  const img = allVirtualStacks[key];
  if (img._resolve) {
    img._resolve(key);
    delete img._resolve;
  }
};

window.onJSVirtualStackClosed = async key => {
  console.log("virtual stack closed: ", key);
};


function updateViewPort() {
  const mvp = document.getElementById("index-viewport");
  if (screen.width < 400) {
    mvp.setAttribute("content", "user-scalable=no,width=400");
  } else {
    mvp.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    );
  }
}


