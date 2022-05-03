import { imjoyRPC } from "imjoy-rpc";
import { version, description } from "../package.json";

export async function setupImJoyAPI(
  api,
  imagej,
  loader,
  javaBytesToArrayBuffer,
  saveImage,
  openImage,
  addMenuItem
) {
  if (!api){
    api = await imjoyRPC.setupRPC({
      name: "ImageJ.JS",
      version: version,
      description: description,
      type: "rpc-window",
      defaults: { fullscreen: true }
    });
  }
  const service_api = {
    setup() {
      api.log("ImageJ.JS loaded successfully.");
    },
    async run(ctx) {
      if (ctx.data && ctx.data.images) {
        //TODO: load images
        for (let img of ctx.data.images) {
          this.viewImage(img);
        }
      }
    },
    addMenuItem,
    async open(path) {
      loader.style.display = "block";
      try {
        await openImage(imagej, path);
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    async save(filename, format, ext) {
      loader.style.display = "block";
      try {
        await saveImage(imagej, filename, format, ext);
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    async runMacro(macro, args) {
      try {
        return await imagej.runMacroAsync(macro, args || "");
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    async installMacro(macro) {
      try {
        await imagej.installMacro(macro);
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    async installTool(tool) {
      try {
        await imagej.installTool(tool);
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    runPlugIn(className, args) {
      imagej.runPlugIn(className, args || "");
    },
    async openVirtualStack(img) {
      return await imagej.openVirtualStack(img);
    },
    async closeVirtualStack(key) {
      await imagej.closeVirtualStack(key);
    },
    async viewZarr(config) {
      return await imagej.viewZarr(config);
    },
    async viewImage(img, options) {
      loader.style.display = "block";
      try {
        imagej.showImage(img, options);
      } catch (e) {
        throw e;
      } finally {
        loader.style.display = "none";
      }
    },
    async getSelection() {
      const imp = await imagej.getImage();
      const bytes = javaBytesToArrayBuffer(
        await imagej.saveAsBytes(imp, "selection")
      );
      return bytes;
    },
    async getDimensions() {
      const imp = await imagej.getImage();
      // d[0] = width;	d[1] = height; d[2] = nChannels;	d[3] = nSlices; d[4] = nFrames;
      return Array.from((await imagej.getDimensions(imp)).slice(1));
    },
    async selectWindow(title) {
      await imagej.selectWindow(title);
    },
    async getImage(format) {
      loader.style.display = "block";
      try {
        if (!format || format === "ndarray" || typeof format !== "string") {
          const imp = await imagej.getImage();
          format = format || {};
          const data = await imagej.getImageData(
            imagej,
            imp,
            format.all || false,
            format.channel || 0,
            format.slice || 0,
            format.frame || 0
          );
          return {
            _rtype: "ndarray",
            _rvalue: data.bytes,
            _rshape: data.shape,
            _rdtype: data.type
          };
        } else {
          const imp = await imagej.getImage();
          return javaBytesToArrayBuffer(await imagej.saveAsBytes(imp, format));
        }
      } finally {
        loader.style.display = "none";
      }
    }
  };

  api.export(service_api);
}
