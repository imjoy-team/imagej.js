import Snackbar from "node-snackbar/dist/snackbar";

const builtinPlugins = [
  "https://gist.githubusercontent.com/oeway/c9592f23c7ee147085f0504d2f3e993a/raw/CellPose-ImageJ.imjoy.html",
  "https://gist.githubusercontent.com/oeway/e5c980fbf6582f25fde795262a7e33ec/raw/itk-vtk-viewer-imagej.imjoy.html"
];
async function startImJoy(app, imjoy) {
  await imjoy.start();
  imjoy.event_bus.on("show_message", msg => {
    Snackbar.show({
      text: msg,
      pos: "bottom-left"
    });
  });
  imjoy.event_bus.on("close_window", w => {
    app.closeWindow(w);
    app.$forceUpdate();
  });
  imjoy.event_bus.on("plugin_loaded", p => {
    app.plugins[p.name] = p;
    if (
      !builtinPlugins.includes(p.config.origin) &&
      p.type !== "window" &&
      p.type !== "rpc-window"
    )
      app.showMenu();
    app.$forceUpdate();
  });
  let windowCount = 0;
  imjoy.event_bus.on("add_window", async w => {
    windowCount++;
    if (document.getElementById(w.window_id)) return;
    if (w.dialog) {
      app.dialogWindows.push(w);
      app.selected_dialog_window = w;
      if (w.fullscreen || w.standalone) app.fullscreen = true;
      else app.fullscreen = false;
      app.$modal.show("window-modal-dialog");
      app.$forceUpdate();
      w.api.show = w.show = () => {
        app.selected_dialog_window = w;
        app.$modal.show("window-modal-dialog");
        imjoy.wm.selectWindow(w);
        w.api.emit("show");
      };

      w.api.hide = w.hide = () => {
        if (app.selected_dialog_window === w) {
          app.$modal.hide("window-modal-dialog");
        }
        w.api.emit("hide");
      };

      setTimeout(() => {
        try {
          w.show();
        } catch (e) {
          console.error(e);
        }
      }, 500);
    } else {
      const title = `${w.name}(#${windowCount})`;
      let width, height;
      if (w.fullscreen || w.standalone) {
        width = -1;
        height = -1;
      } else {
        width = Math.min(w.w * 30, document.body.clientWidth);
        height = Math.min(w.h * 30, document.body.clientHeight);
      }
      await window.ij.createPlugInFrame(title, 0, 100, width, height);
      // find the window element by the title
      const xpath = `//a[text()='${title}']`;
      const matchingElement = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      const titleBar = matchingElement.parentNode;
      const container = titleBar.previousSibling;
      const elem = document.createElement("div");
      elem.id = w.window_id;
      elem.style.marginTop = "20px";
      elem.style.height = "100%";
      container.appendChild(elem);
      titleBar.addEventListener("dragstart", () => {
        elem.style.pointerEvents = "none";
      });
      titleBar.addEventListener("dragend", () => {
        elem.style.pointerEvents = "auto";
      });
      const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            // resizerBord div added during resizing
            if (mutation.addedNodes.length === 1)
              elem.style.pointerEvents = "none";
            // resizerBord div removed after resizing
            else if (mutation.removedNodes.length === 1)
              elem.style.pointerEvents = "auto";
            break;
          }
        }
      });
      // observe after the initialization
      setTimeout(() => {
        observer.observe(container.parentNode, { childList: true });
      }, 2000);
    }
  });
  // load built-in plugins
  for (const p of builtinPlugins) {
    app.loadPlugin(p);
  }
  app.loadPluginByQuery();
  window.runImJoyPlugin = code => {
    loader.style.display = "block";
    imjoy.pm
      .reloadPlugin({ code: code, load_dependencies: true })
      .then(plugin => {
        Snackbar.show({
          text: `Plugin "${plugin.name}" loaded successfully.`,
          pos: "bottom-left"
        });
        app.plugins[plugin.name] = plugin;
        app.$forceUpdate();
        if (plugin.api && plugin.api.run) {
          plugin.api.run({});
        } else {
          Snackbar.show({
            text: `No "run" function defined in Plugin "${plugin.name}".`,
            pos: "bottom-left"
          });
        }
      })
      .finally(() => {
        loader.style.display = "none";
      });
  };

  window.reloadImJoyPlugin = code => {
    loader.style.display = "block";
    imjoy.pm
      .reloadPlugin({ code: code, load_dependencies: true })
      .then(plugin => {
        Snackbar.show({
          text: `Plugin "${plugin.name}" loaded successfully.`,
          pos: "bottom-left"
        });
        app.plugins[plugin.name] = plugin;
        app.$forceUpdate();
      })
      .finally(() => {
        loader.style.display = "none";
      });
  };

  window.callPlugin = async function(pluginName, functionName) {
    let args = Array.prototype.slice.call(arguments).slice(2);
    let promise = null;
    if (args.length > 0) {
      promise = args[args.length - 1];
      args = args.slice(0, args.length - 1);
    }
    const plugin = await imjoy.pm.imjoy_api.getPlugin(null, pluginName);
    try {
      loader.style.display = "block";
      for (let i = 0; i < args.length; i++) {
        // convert ImagePlus to numpy array
        if (args[i].constructor.name.endsWith("ImagePlus")) {
          const imgData = await window.ij.getImageData(
            window.ij,
            args[i],
            false
          );
          args[i] = {
            _rtype: "ndarray",
            _rshape: imgData.shape,
            _rdtype: imgData.type,
            _rvalue: imgData.bytes
          };
        }
      }

      const result = await plugin[functionName].apply(plugin, args);
      if (promise) {
        if (typeof result === "string") {
          await cjCall(promise, "resolveString", result);
        } else if (result._rtype === "ndarray") {
          const ip = await ij.ndarrayToImagePlus(result);
          await cjCall(promise, "resolveImagePlus", ip);
        } else {
          if (promise)
            await cjCall(promise, "reject", "unsupported result type");
          else {
            console.error("Unsupported result type:", result);
          }
        }
      }
    } catch (e) {
      if (promise) await cjCall(promise, "reject", e.toString());
      else {
        console.error(e);
      }
    } finally {
      loader.style.display = "none";
    }
  };
}

const CSStyle = `
<style>
.vm--modal{
  max-height: 100%!important;
  max-width: 100%!important;
}
.imjoy-inline-window{
  width: 100%;
  height: 600px;
}
.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.dialog-control{
  font-family: monospace;
  margin-left: 2px;
  width: 18px!important;
  height: 16px;
  border:0px;
  font-size:1rem;
  position: relative;
  color:white;
  top:1px;
}
.dialog-control:focus {
  outline: none;
}
</style>`;

const APP_TEMPLATE = `
<div style="padding-left: 1px;padding-top: 1px;">
<div class="dropdown">
  <img class="dropbtn" src="https://imjoy.io/static/img/imjoy-icon-white.svg">
  <span class="dropbtn dropbtn-ext">ImJoy</span>
  <div class="dropdown-content">
    <a href="#" v-for="(p, name) in plugins" v-show="p.config.runnable!==false" :key="p.id" :title="p.config.description" :style="{color: p.api.run?'#0456ef':'gray'}" @click="run(p)">{{p.name}}</a>
    <hr class="solid"  v-if="plugins&&Object.keys(plugins).length>0">
    <a href="#" title="Load a new plugin" @click="loadPlugin()"><i class="fa-plus fa"></i>&nbsp;ImJoy Plugin</a>
    <a href="#" title="Show ImJoy API documentation" @click="loadImJoyApp()"><i class="fa-rocket fa"></i>&nbsp;ImJoy App</a>
    <a title="Show ImJoy API documentation" href="#" @click="showAPIDocs()"><i class="fa-book fa"></i>&nbsp;ImJoy Docs</a>
    <a title="About ImJoy" href="#" @click="aboutImJoy()"><i class="fa-info-circle fa"></i>&nbsp;About ImJoy</a>
    <hr class="solid"  v-if="dialogWindows && dialogWindows.length>0">
    <a v-for="wdialog in dialogWindows" :title="wdialog.name" style="font-size: 14px;" class="btn btn-default" @click="showWindow(wdialog)"><i class="fa-window-maximize fa"></i>&nbsp;{{wdialog.name}}</a>
    <hr class="solid">
    <a class="badge" href="https://github.com/imjoy-team/imagej.js" target="_blank"><img src="https://img.shields.io/badge/Github-ImageJ.JS-blue" alt="Github"></img></a>
  </div>
</div>

<modal name="window-modal-dialog" height="500px" style="max-height: 100%; max-width: 100%" :fullscreen="fullscreen" :resizable="true" draggable=".drag-handle" :scrollable="true">
    <div v-if="selected_dialog_window" @dblclick="maximizeWindow()" class="navbar-collapse collapse drag-handle" style="cursor:move; background-color: #448aff; color: white; text-align: center;">
    <div class="dialog-ctrl" style="position: absolute; left:2px; margin-top: -1px;">
      <button @click="closeWindow(selected_dialog_window)" class="noselect dialog-control" style="background:#ff0000c4;">
        X
      </button>
      <button @click="minimizeWindow()"  class="noselect dialog-control" style="background:#00cdff61;">
        -
      </button>
      <button @click="maximizeWindow()" class="noselect dialog-control" style="background:#00cdff61;">
        {{fullscreen?'=': '+'}}
      </button>
    </div>
      <span class="noselect">{{ selected_dialog_window.name}}</span>
      
    </div>
  <template v-for="wdialog in dialogWindows">
    <div
      :key="wdialog.window_id"
      v-show="wdialog === selected_dialog_window"
      style="height: calc(100% - 18px);"
    >
      <div :id="wdialog.window_id" style="width: 100%;height: 100%;"></div>
    </div>
  </template>
</modal>
</div>
`;

function promisify_functions(obj, bind) {
  const ret = {};
  for (let k in obj) {
    if (typeof obj[k] === "function") {
      // make sure it returns a promise
      let func = obj[k];
      if (bind) func = func.bind(null, bind);
      if (func.constructor.name !== "AsyncFunction") {
        ret[k] = function(...args) {
          return Promise.resolve(func(...args));
        };
      } else {
        ret[k] = func;
      }
    } else {
      ret[k] = obj[k];
    }
  }
  ret._rintf = true;
  return ret;
}

export async function setupImJoyApp(setAPI) {
  const vue = await import("vue/dist/vue.common");
  const vuejsmodal = await import("vue-js-modal");
  const imjoyCore = await import("imjoy-core");
  const Vue = vue.default;
  Vue.use(vuejsmodal.default);
  var elem = document.createElement("div");
  elem.id = "imjoy-menu";
  elem.innerHTML = APP_TEMPLATE;
  document.body.appendChild(elem);
  document.head.insertAdjacentHTML("beforeend", CSStyle);

  const app = new Vue({
    el: "#imjoy-menu",
    data: {
      dialogWindows: [],
      selected_dialog_window: null,
      plugins: {},
      fullscreen: false,
      imjoy: null,
      active_plugin: null
    },
    mounted() {
      console.log(`ImJoy Core (v${imjoyCore.VERSION}) loaded.`);
      const imjoy = new imjoyCore.ImJoy({
        imjoy_api: {
          getWindow(_plugin, config) {
            return new Promise((resolve, reject) => {
              if (
                config === "ImageJ.JS" ||
                config.name === "ImageJ.JS" ||
                config.type === "ImageJ.JS"
              ) {
                if (config === "ImageJ.JS") {
                  config = { name: "ImageJ.JS", type: "ImageJ.JS" };
                }
                const api = Object.assign({}, imjoy.pm.imjoy_api);
                api.export = (_plugin, service_api) => {
                  resolve(promisify_functions(service_api));
                };
                api.registerCodec = () => {
                  throw "register codec is not implemented yet.";
                };
                // we need to pass the Plugin object as second argument
                // use config for now
                // TODO: pass the actual plugin object
                setAPI(promisify_functions(api, config));
              } else {
                imjoy.pm
                  .getWindow(_plugin, config)
                  .then(resolve)
                  .catch(reject);
              }
            });
          },
          async showStatus(_plugin, msg) {
            await window.ij.showStatus(msg);
          },
          async showProgress(_plugin, p) {
            if (p > 1) p = p / 100;
            await window.ij.showProgress(p);
          },
          async showMessage(_plugin, msg, duration) {
            duration = duration || 5;
            Snackbar.show({
              text: msg,
              pos: "bottom-left"
            });
            await window.ij.showStatus(msg);
          },
          async showDialog(_plugin, config) {
            config.dialog = true;
            return await imjoy.pm.createWindow(_plugin, config);
          }
        }
      });
      this.imjoy = imjoy;
      startImJoy(this, this.imjoy).then(() => {
        imjoy.pm.reloadPluginRecursively({
          uri:
            "https://imjoy-team.github.io/jupyter-engine-manager/Jupyter-Engine-Manager.imjoy.html"
        });
      });
    },
    methods: {
      showMenu() {
        const dm = document.querySelector(
          "#imjoy-menu>div>.dropdown>.dropdown-content"
        );
        dm.style.display = "block";
        setTimeout(() => {
          dm.style.display = "";
        }, 3000);
      },
      loadImJoyApp() {
        this.imjoy.pm.imjoy_api.showDialog(null, {
          src: "https://imjoy.io/#/app",
          fullscreen: true,
          passive: true
        });
      },
      aboutImJoy() {
        this.imjoy.pm.imjoy_api.showDialog(null, {
          src: "https://imjoy.io/#/about",
          passive: true
        });
      },
      showAPIDocs() {
        this.imjoy.pm.imjoy_api.createWindow(null, {
          src: "https://imjoy.io/docs/#/api",
          passive: true
        });
      },
      async connectPlugin() {
        const plugin = await this.imjoy.pm.connectPlugin(new Connection());
        this.plugins[plugin.name] = plugin;
        this.active_plugin = plugin;
        this.$forceUpdate();
      },
      async runNotebookPlugin() {
        try {
          const plugin = this.active_plugin;
          if (plugin.api.run) {
            let config = {};
            if (plugin.config.ui && plugin.config.ui.indexOf("{") > -1) {
              config = await this.imjoy.pm.imjoy_api.showDialog(
                plugin,
                plugin.config
              );
            }
            await plugin.api.run({
              config: config,
              data: {}
            });
          }
        } catch (e) {
          console.error(e);
          this.showMessage(`Failed to load the plugin, error: ${e}`);
        }
      },
      async run(plugin) {
        let config = {};
        if (plugin.config.ui && plugin.config.ui.indexOf("{") > -1) {
          config = await this.imjoy.pm.imjoy_api.showDialog(
            plugin,
            plugin.config
          );
        }
        await plugin.api.run({
          config: config,
          data: {}
        });
      },
      showMessage(msg, duration) {
        duration = duration || 5;
        Snackbar.show({
          text: msg,
          pos: "bottom-left"
        });
      },
      loadPlugin(p) {
        if (!p) {
          p = prompt(
            `Please type a ImJoy plugin URL`,
            "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"
          );
          if (!p) return;
        }
        this.imjoy.pm
          .reloadPluginRecursively({
            uri: p
          })
          .then(async plugin => {
            this.plugins[plugin.name] = plugin;
            if (!builtinPlugins.includes(plugin.config.origin))
              this.showMessage(
                `Plugin ${plugin.name} successfully loaded, you can now run it from the ImJoy plugin menu.`
              );
            this.$forceUpdate();
          })
          .catch(e => {
            console.error(e);
            this.showMessage(`Failed to load the plugin, error: ${e}`);
          });
      },
      loadPluginByQuery() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has("plugin") || urlParams.has("p")) {
          const p = urlParams.get("plugin") || urlParams.get("p");
          this.loadPlugin(p);
        }
      },
      showWindow(w) {
        if (w.fullscreen || w.standalone) this.fullscreen = true;
        else this.fullscreen = false;
        if (w) this.selected_dialog_window = w;
        this.$modal.show("window-modal-dialog");
      },
      closeWindow(w) {
        if (this.selected_dialog_window === w) {
          this.selected_dialog_window = null;
          this.$modal.hide("window-modal-dialog");
        }
        const idx = this.dialogWindows.indexOf(w);
        if (idx >= 0) this.dialogWindows.splice(idx, 1);
      },
      minimizeWindow() {
        this.$modal.hide("window-modal-dialog");
      },
      maximizeWindow() {
        this.fullscreen = !this.fullscreen;
      }
    }
  });
  window.connectPlugin = async function() {
    await app.connectPlugin();
    await app.runNotebookPlugin();
  };
  window._connectPlugin = async function() {
    await app.connectPlugin();
  };
  window._runPluginOnly = async function() {
    await app.runNotebookPlugin();
  };
}
