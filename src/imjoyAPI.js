import { setupRPC } from "imjoy-rpc";

import { version, description } from "../package.json";
import { imjoyRPC } from "imjoy-rpc/dist/imjoy-rpc";

export async function setupImJoyAPI(
  imagej,
  getImageData,
  javaBytesToArrayBuffer,
  saveImage,
  openImage,
  addMenuItem
) {
  const api = await setupRPC({
    name: "ImageJS",
    version: version,
    description: description,
    type: "rpc-window"
  });
  const service_api = {
    setup() {
      api.log("ImageJS loaded successfully.");
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
    open(path) {
      openImage(imagej, path);
    },
    save(filename, format, ext) {
      saveImage(imagej, filename, format, ext);
    },
    runMacro(macro, args) {
      imagej.runMacro(macro, args || "");
    },
    runPlugIn(className, args) {
      imagej.runPlugIn(className, args || "");
    },
    async viewImage(img, options) {
      options = options || {};
      options.name = options.name || "tmp";
      const filepath = "/str/" + options.name;
      const formats = {
        uint8: "8-bit",
        uint16: "16-bit Unsigned",
        int16: "16-bit Signed",
        uint32: "32-bit Unsigned",
        int32: "32-bit Signed"
      };
      cheerpjAddStringFile(filepath, new Uint8Array(img._rvalue));
      let format = formats[img._rdtype];

      if (img._rshape.length === 3) {
        let number = img._rshape[2];
        if (img._rshape[2] === 3) {
          format = "[24-bit RGB]";
          number = 1;
        }
        return await imagej.run(
          "Raw...",
          `open=${filepath} image=${format} width=${img._rshape[1]} height=${img._rshape[0]} number=${number}`
        );
      } else if (img._rshape.length === 4) {
        if (img._rshape[3] === 3) {
          format = "[24-bit RGB]";
        } else {
          if (img._rshape[3] !== 1) {
            throw "channel dimension (last) can only be 1 or 3";
          }
        }
        return await imagej.run(
          "Raw...",
          `open=${filepath} image=${format} width=${img._rshape[2]} height=${img._rshape[1]} number=${img._rshape[0]}`
        );
      } else if (img._rshape.length === 2) {
        return await imagej.run(
          "Raw...",
          `open=${filepath} image=${format} width=${img._rshape[1]} height=${img._rshape[0]}`
        );
      }
    },
    async getSelection() {
      const imp = await imagej.getImage();
      const bytes = javaBytesToArrayBuffer(await imagej.saveAsBytes(imp, "selection"));
      return bytes;
    },
    async getImage() {
      const data = await getImageData(imagej);
      return {
        _rtype: "ndarray",
        _rvalue: data.bytes,
        _rshape: data.shape,
        _rdtype: data.type
      };
    }
  };

  api.export(service_api);
}
