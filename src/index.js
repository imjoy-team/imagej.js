async function startImageJ() {
    cheerpjInit({
        enableInputMethods: true,
        clipboardMode: "system"
    });
    const appContainer = document.getElementById('app-container');
    cheerpjCreateDisplay(-1, -1, appContainer);
    cheerpjRunMain("ij.ImageJ", "/app/imagej-1/ij.jar");

    const ij = await getImageJInstance()
    window.imagej = {
        doCommand: await cjResolveCall("ij.IJ", "doCommand", ["java.lang.String"]),
        runCommand: await cjResolveCall("ij.IJ", "run", ["java.lang.String"]),
        showStatus: await cjResolveCall("ij.IJ", "showStatus", ["java.lang.String"]),
        showMessage: await cjResolveCall("ij.IJ", "showMessage", ["java.lang.String", "java.lang.String"]),
        runPlugIn: await cjResolveCall("ij.IJ", "runPlugIn", ["java.lang.String", "java.lang.String"]),
        openFile: await cjResolveCall("ij.IJ", "open", ["java.lang.String"]),
    }
    imagej.showStatus("imagej.js loaded!")

}

async function openJSFile(file) {
    const filepath = "/str/" + file.name
    const bytes = await readFile(file)
    cheerpjAddStringFile(filepath, bytes);
    await imagej.openFile(filepath)
}

function setupDragAndDrop() {
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
                openJSFile(files[i]);
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
startImageJ().then(() => {
    setupDragAndDrop();
})