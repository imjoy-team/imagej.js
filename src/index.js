import {
    setupImJoyAPI
} from "./imjoyAPI.js";

async function startImageJ() {
    cheerpjInit({
        enableInputMethods: true,
        clipboardMode: "system"
    });
    const appContainer = document.getElementById('app-container');
    cheerpjCreateDisplay(-1, -1, appContainer);
    cheerpjRunStaticMethod(threads[0], "java/lang/System", cjSystemSetProperty, "user.dir", "/files");
    cheerpjRunStaticMethod(threads[0], "java/lang/System", cjSystemSetProperty, "plugins.dir", "/app/ij153");
    cheerpjRunMain("ij.ImageJ", "/app/ij153/ij.jar:/app/ij153/plugins/Thunder_STORM.jar");

    const ij = await getImageJInstance()
    // turn on debug mode
    // cjCall("ij.IJ", "setDebugMode", true)

    return {
        run: await cjResolveCall("ij.IJ", "run", ["java.lang.String", "java.lang.String"]),
        showStatus: await cjResolveCall("ij.IJ", "showStatus", ["java.lang.String"]),
        showMessage: await cjResolveCall("ij.IJ", "showMessage", ["java.lang.String", "java.lang.String"]),
        runPlugIn: await cjResolveCall("ij.IJ", "runPlugIn", ["java.lang.String", "java.lang.String"]),
        openFile: await cjResolveCall("ij.IJ", "open", ["java.lang.String"]),
        installPlugin: await cjResolveCall("ij.Menus", "installPlugin", null),
        getPlugins: await cjResolveCall("ij.Menus", "getPlugins", []),
        getPlugInsPath: await cjResolveCall("ij.Menus", "getPlugInsPath", []),
        getImage: await cjResolveCall("ij.IJ", "getImage", []),
        save: await cjResolveCall("ij.IJ", "save", ["ij.ImagePlus", "java.lang.String"]),
        saveAs: await cjResolveCall("ij.IJ", "saveAs", ["ij.ImagePlus", "java.lang.String", "java.lang.String"]),
        getString: await cjResolveCall("ij.IJ", "getString", ["java.lang.String", "java.lang.String"]),
        // updateImageJMenus: await cjResolveCall("ij.Menus", "updateImageJMenus", null),
        // getPrefsDir: await cjResolveCall("ij.Prefs", "getPrefsDir", null),
    }
}

async function mountFile(file) {
    const filepath = "/str/" + file.name
    const bytes = await readFile(file)
    cheerpjAddStringFile(filepath, bytes);
    return filepath;
}

async function getImageData(imagej) {
    const imp = await imagej.getImage();
    const name = cjStringJavaToJs(await cjCall(imp, "getTitle"))
    const width = await cjCall(imp, "getWidth")
    const height = await cjCall(imp, "getHeight")
    const slices = await cjCall(imp, "getNSlices")
    const channels = await cjCall(imp, "getNChannels")
    const frames = await cjCall(imp, "getNFrames")
    const type = await cjCall(imp, "getType")
    const bytes = await saveFileToBytes(imagej, imp, 'raw', name)
    return {
        type: type.value0,
        shape: [height.value0, width.value0, channels.value0, slices.value0, frames.value0],
        bytes
    }
}

function saveFileToBytes(imagej, imp, format, filename) {
    return new Promise(async (resolve, reject) => {
        await imagej.saveAs(imp, format, '/files/' + filename)
        const request = indexedDB.open("cjFS_/files/");
        request.onerror = function (event) {
            console.error("Failed to read file", event);
            reject("Failed to open file system")
        };
        request.onsuccess = function (event) {
            const db = event.target.result;
            var transaction = db.transaction(["files"], "readwrite");
            var objectStore = transaction.objectStore("files");
            const req = objectStore.get("/" + filename);
            req.onsuccess = (e) => {
                const fileBytes = e.target.result.contents
                objectStore.delete("/" + filename)
                resolve(fileBytes)
            }
            req.onerror = () => {
                reject("Failed to read file: " + filename)
            }
        };
    })

}

async function fixMenu(imagej) {
    const removes = ["Open Next", "Open Samples", "Open Recent", "Show Folder",
        "Copy to System", "Import", "Revert", "Install...", "Run...", "Edit...", "Compile and Run...",
        "Capture Screen", "Capture Delayed...", "Capture Image",
    ]
    const items = document.querySelectorAll("#cheerpjDisplay>.window:nth-child(2) li > a")
    for (let it of items) {
        it.text = it.text.trim()
        if (removes.includes(it.text)) {
            // remove li
            const el = it.parentNode;
            el.parentNode.removeChild(el);
        } else if (it.text === 'Open...') {
            const openMenu = it.parentNode;
            const fileInput = document.getElementById('open-file')
            fileInput.onchange = () => {
                const files = fileInput.files;
                for (let i = 0, len = files.length; i < len; i++) {
                    mountFile(files[i]).then((filepath) => {
                        imagej.openFile(filepath)
                    })
                }
                fileInput.value = "";
            }
            openMenu.onclick = (e) => {

                e.stopPropagation()
                fileInput.click()
            }
        } else {
            function fixSaveMenu(format, ext) {
                const saveMenu = it.parentNode;
                saveMenu.onclick = async (e) => {
                    e.stopPropagation()
                    const imp = await imagej.getImage();
                    const original_name = cjStringJavaToJs(await cjCall(imp, "getTitle"))
                    const filename = cjStringJavaToJs(await imagej.getString("Saving file as ", original_name.split('.')[0] + (ext || ('.' + format))))
                    if (filename) {
                        const fileBytes = await saveFileToBytes(imagej, imp, format, filename)
                        const blob = new Blob([fileBytes.buffer], {
                            type: "application/octet-stream"
                        });

                        if (window.navigator.msSaveOrOpenBlob) {
                            window.navigator.msSaveBlob(blob, filename);
                        } else {
                            const elem = window.document.createElement('a');
                            elem.href = window.URL.createObjectURL(blob);
                            elem.download = filename;
                            document.body.appendChild(elem);
                            elem.click();
                            document.body.removeChild(elem);
                        }
                    }
                }
            }
            if (it.text === 'Save' || it.text === 'Tiff...') {
                fixSaveMenu('tiff', '.tif')
            } else if (it.text === 'Gif...') {
                fixSaveMenu('gif', '.gif')
            } else if (it.text === 'Jpeg...') {
                fixSaveMenu('jpeg', '.jpg')
            } else if (it.text === 'Text Image...') {
                fixSaveMenu('text image', '.txt')
            } else if (it.text === 'ZIP...') {
                fixSaveMenu('zip', '.zip')
            } else if (it.text === 'Raw Data...') {
                fixSaveMenu('raw', '.raw')
            } else if (it.text === 'Raw Data...') {
                fixSaveMenu('raw', '.raw')
            } else if (it.text === 'Image Sequence...') {
                // remove li
                const el = it.parentNode;
                el.parentNode.removeChild(el);
            } else if (it.text === 'AVI...') {
                fixSaveMenu('avi', '.avi')
            } else if (it.text === 'BMP...') {
                fixSaveMenu('bmp', '.bmp')
            } else if (it.text === 'PNG...') {
                fixSaveMenu('png', '.png')
            } else if (it.text === 'PGM...') {
                fixSaveMenu('pgm', '.pgm')
            } else if (it.text === 'FITS...') {
                fixSaveMenu('fits', '.fits')
            } else if (it.text === 'LUT...') {
                fixSaveMenu('lut', '.lut')
            } else if (it.text === 'Selection...') {
                fixSaveMenu('selection', '.roi')
            } else if (it.text === 'XY Coordinates...') {
                fixSaveMenu('xy Coordinates', '.txt')
            } else if (it.text === 'Results...') {
                fixSaveMenu('measurements', '.csv')
            } else if (it.text === 'Text...') {
                fixSaveMenu('text', '.txt')
            }

        }
    }
}

function setupDragAndDrop(imagej) {
    const appContainer = document.getElementById('app-container');
    const dragOverlay = document.getElementById("drag-overlay");

    appContainer.addEventListener('dragenter', (e) => {
        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            e.stopPropagation();
            dragOverlay.style.display = "block";
        }
    }, false);
    appContainer.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            e.stopPropagation();
            dragOverlay.style.display = "block";
        }
    }, false);
    appContainer.addEventListener('dragleave', (e) => {

        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            e.stopPropagation();
            dragOverlay.style.display = "none";
        }
    }, false);
    appContainer.addEventListener('drop', (e) => {

        if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            e.stopPropagation();
            const data = e.dataTransfer,
                files = data.files;
            for (let i = 0, len = files.length; i < len; i++) {
                mountFile(files[i]).then((filepath) => {
                    imagej.openFile(filepath)
                })
            }
            dragOverlay.style.display = "none";
        }

    }, false);
}


function getImageJInstance() {
    return new Promise((resolve) => {
        async function tryIJ() {
            const ij = await cjCall("ij.IJ", "getInstance")
            if (!ij) {
                setTimeout(tryIJ, 500)
            } else {
                resolve(ij)
            }
        }
        tryIJ();
    })
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function () {
            const arrayBuffer = reader.result
            const bytes = new Uint8Array(arrayBuffer);
            resolve(bytes);
        }
        reader.onerror = function (e) {
            reject(e)
        }
    })

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


function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function (err) {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
}

registerServiceWorker();
fixHeight();
startImageJ().then((imagej) => {
    setupDragAndDrop(imagej);
    setTimeout(() => {
        fixMenu(imagej);
    }, 2000)

    // if inside an iframe, setup ImJoy
    if (window.self !== window.top) {
        setupImJoyAPI(imagej, getImageData, saveFileToBytes);
    }
})