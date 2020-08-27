import {
  setupRPC
} from 'imjoy-rpc';

export async function setupImJoyAPI(imagej) {
  const api = await setupRPC({
    name: "ImageJ.JS",
    version: "0.1.0",
    description: "ImageJ running in the browser",
    type: "rpc-window"
  });

  const service_api = {
    setup() {
      api.log("ImageJ.JS loaded successfully.");
    },
    async run(ctx) {
      if (ctx.data && ctx.data.images) {
        //TODO: load images
      }
    },
    async getImage() {
      return imagej.getImage();
    }
  };

  api.export(service_api);
}