import Snackbar from "node-snackbar/dist/snackbar";

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
    app.showMenu();
  });
  imjoy.event_bus.on("add_window", w => {
    if (document.getElementById(w.window_id)) return;
    if (!w.dialog && app.active_plugin) {
      if (document.getElementById(app.active_plugin.id)) {
        const elem = document.createElement("div");
        elem.id = w.window_id;
        elem.classList.add("imjoy-inline-window");
        document.getElementById(app.active_plugin.id).appendChild(elem);
        return;
      }
    }
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
  });

  app.loadPluginByQuery();
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


<div style="padding-left: 5px;">
<div class="dropdown">
  <img class="dropbtn" src="https://imjoy.io/static/img/imjoy-icon-white.svg">
  <span class="dropbtn dropbtn-ext">ImJoy</span>
  <div class="dropdown-content">
    <a href="#" v-for="(p, name) in plugins" :key="p.id" :title="p.config.description" :style="{color: p.api.run?'#0456ef':'gray'}" @click="run(p)">{{p.name}}</a>
    <hr class="solid"  v-if="plugins&&Object.keys(plugins).length>0">
    <a href="#" title="Load a new plugin" @click="loadPlugin()"><i class="fa-plus fa"></i>&nbsp;ImJoy Plugin</a>
    <a href="#" title="Show ImJoy API documentation" @click="loadImJoyApp()"><i class="fa-rocket fa"></i>&nbsp;ImJoy App</a>
    <a title="Show ImJoy API documentation" href="#" @click="showAPIDocs()"><i class="fa-book fa"></i>&nbsp;ImJoy Docs</a>
    <a title="About ImJoy" href="#" @click="aboutImJoy()"><i class="fa-info-circle fa"></i>&nbsp;About ImJoy</a>
    <a v-for="wdialog in dialogWindows" :title="wdialog.name" class="btn btn-default" @click="showWindow(wdialog)">{{wdialog.name}}</a>
    <hr class="solid">
    <a class="badge" href="https://github.com/imjoy-team/imagej.js" target="_blank"><img src="https://img.shields.io/badge/Github-ImageJ.JS-blue" alt="Github"></img></a>
  </div>
</div>

<modal name="window-modal-dialog" height="500px" style="max-height: 100%; max-width: 100%" :fullscreen="fullscreen" :resizable="true" draggable=".drag-handle" :scrollable="true">
    <div v-if="selected_dialog_window" @dblclick="maximizeWindow()" class="navbar-collapse collapse drag-handle" style="cursor:move; background-color: #448aff; color: white; text-align: center;">
    <div style="position: absolute; left:2px; margin-top: -1px;">
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

function promisify_functions(obj) {
  const ret = {};
  for (let k in obj) {
    if (typeof obj[k] === "function") {
      // make sure it returns a promise
      const func = obj[k];
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
  elem.style.position = "absolute";
  document.body.appendChild(elem);

  const titleBar = document.querySelector(".titleBar");
  const updatePos = ()=>{
    const bbox = titleBar.getBoundingClientRect();
    const elem = document.getElementById("imjoy-menu");
    elem.style.left = (bbox.left -4) + "px";
    elem.style.top = (bbox.top + 1) + "px";
  }
  titleBar.addEventListener("drag", updatePos);
  updatePos();

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
      window.dispatchEvent(new Event("resize"));
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
                const api = Object.assign({}, imjoy.pm.imjoy_api);
                api.export = service_api => {
                  resolve(promisify_functions(service_api));
                };
                api.registerCodec = () => {
                  throw "register codec is not implemented yet.";
                };
                setAPI(promisify_functions(api));
              } else {
                imjoy.pm
                  .getWindow(_plugin, config)
                  .then(resolve)
                  .catch(reject);
              }
            });
          },
          async showMessage(_plugin, msg, duration) {
            duration = duration || 5;
            Snackbar.show({
              text: msg,
              pos: "bottom-left"
            });
          },
          async showDialog(_plugin, config) {
            config.dialog = true;
            return await imjoy.pm.createWindow(_plugin, config);
          }
        }
      });
      this.imjoy = imjoy;
      startImJoy(this, this.imjoy);
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
        this.imjoy.pm.imjoy_api.showDialog(null, {
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
        if(!p){
          p = prompt(
            `Please type a ImJoy plugin URL`,
            "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"
          );
        }
        this.imjoy.pm
          .reloadPluginRecursively({
            uri: p
          })
          .then(async plugin => {
            this.plugins[plugin.name] = plugin;
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
        this.selected_dialog_window = null;
        this.$modal.hide("window-modal-dialog");
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
