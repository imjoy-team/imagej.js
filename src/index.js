import { setupImJoyApp } from "./imjoyApp.js";
import { setupImJoyAPI } from "./imjoyAPI.js";
import { githubUrlRaw, convertZenodoFileUrl } from "./utils.js";

import Snackbar from "node-snackbar/dist/snackbar";
import "node-snackbar/dist/snackbar.css";
import A11yDialog from "a11y-dialog";
import { polyfill } from "mobile-drag-drop";

// optional import of scroll behaviour
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

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
window.onEditorResized = () => {
  setTimeout(() => {
    for (let id in codeEditors) {
      const textArea = document.getElementById(id);
      if (textArea) {
        const bbox = textArea.getBoundingClientRect();
        codeEditors[id].setSize(bbox.width - 8, bbox.height - 7);
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

function replaceTextArea(elm) {
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
  myCodeMirror.setSize(bbox.width - 8, bbox.height - 7);
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
  elm.addEventListener("touchstart", touchClick, false);
  if (elm.nodeName === "TEXTAREA") {
    function tryReplace() {
      if (!document.contains(elm)) {
        setTimeout(tryReplace, 200);
        return;
      }
      // only apply to textarea in a window
      if (elm.parentNode.nextSibling.classList[0] === "titleBar") {
        if (elm.style.display === "none") setTimeout(tryReplace, 200);
        else if (
          elm.parentNode.nextSibling.children[0].innerText.endsWith(".html")
        )
          replaceTextArea(elm);
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

async function startImageJ(version) {
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
  if(version === '2'){
    cheerpjRunMain("net.imagej.Main", "/app/ij211/imagej2-cheerpj-0-SNAPSHOT-all.jar");
  }
  else{
    cheerpjRunMain("ij.ImageJ", "/app/ij153/ij-1.53e.jar");
  }
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

// Note: 'channel', 'slice' and 'frame' are one-based indexes
async function getImageData(imagej, imp, channel, slice, frame) {
  // const name = cjStringJavaToJs(await cjCall(imp, "getTitle"));
  const width = await cjCall(imp, "getWidth");
  const height = await cjCall(imp, "getHeight");
  const slices = { value0: 1 }; //await cjCall(imp, "getNSlices");
  const channels = await cjCall(imp, "getNChannels");
  const frames = { value0: 1 }; // await cjCall(imp, "getNFrames");
  const type = await cjCall(imp, "getType");
  if (channel === undefined) channel = 0; // 0 means current channel
  if (slice === undefined) slice = 0; // 0 means current slice
  if (frame === undefined) frame = 0; // 0 means current frame
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

  // addMenuItem({
  //   label: "Debug",
  //   async callback() {
  //   }
  // });
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

function fixStyle() {
  if (iOS()) {
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
      margin-top: -1px;
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

function cheerpjRemoveStringFile(name) {
  var mount = cheerpjGetFSMountForPath(name);
  assert(mount instanceof CheerpJDataFolder);
  const path = name.substr(mount.mountPoint.length - 1);
  delete mount.files[path];
}

async function loadContentFromUrl(imagej, url) {
  try {
    Snackbar.show({
      text: "Opening " + url,
      pos: "bottom-left"
    });
    // convert to raw if we can
    if (url.includes("//zenodo.org/record")) {
      url = await convertZenodoFileUrl(url);
    } else {
      const tmp =
        (await githubUrlRaw(url, ".ijm")) ||
        (await githubUrlRaw(url, ".imjoy.html"));
      url = tmp || url;
    }

    await imagej.open(url);
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
  if (urlParams.has("open")) {
    const urls = urlParams.getAll("open");
    for (let url of urls) {
      await loadContentFromUrl(imagej, url);
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
    saveBytes: await cjResolveCall("ij.IJ", "saveBytes", null)
    // updateImageJMenus: await cjResolveCall("ij.Menus", "updateImageJMenus", null),
    // getPrefsDir: await cjResolveCall("ij.Prefs", "getPrefsDir", null),
  };
  window.ij = imagej;
  setupDragDropPaste(imagej);
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

document.addEventListener(
  "DOMContentLoaded",
  function() {
    updateViewPort();
    window.addEventListener("resize", updateViewPort);
    registerServiceWorker();
    fixHeight();
    fixStyle();
    console.time("Loading ImageJ.JS");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    window.ij_version = urlParams.get('version');
    startImageJ(window.ij_version)
    if(window.ij_version === '2'){
      // setTimeout(window.onImageJInitialized, 5000);
      loader.style.display = "none";
    }
  },
  false
);
