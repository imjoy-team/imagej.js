let zarrLib;
export async function loadZarrImage(config) {
  config = config || {};
  if (!config.source) {
    throw new Error("source field is missing.");
  }
  if (!zarrLib)
    zarrLib = await import(
      /* webpackIgnore: true */ "https://cdn.skypack.dev/@manzt/zarr-lite"
    );

  let store;
  if (typeof config.source === "string" && config.source.startsWith("http")) {
    config.name =
      config.name ||
      config.source
        .split("/")
        .pop()
        .split("#")[0]
        .split("?")[0];
    store = new zarrLib.HTTPStore(config.source);
  } else if (typeof config.source === "object" && config.source.getItem) {
    store = config.source;
  } else {
    throw new Error("Invalid source, it must be an URL or a zarr store.");
  }

  config.name = config.name || "zarr image";

  async function loadPyramid() {
    const rootAttrs = await zarrLib.getJson(store, ".zattrs");
    console.log("rootAttrs", rootAttrs);
    let paths = [];
    if ("multiscales" in rootAttrs) {
      const { datasets } = rootAttrs.multiscales[0];
      paths = datasets.map(d => d.path);
    }
    const p = paths.map(path =>
      zarrLib.openArray({
        store,
        path
      })
    );
    return Promise.all(p);
  }

  const pyramid = await loadPyramid();
  const zarr_arr = pyramid[0];

  let [sizeT, sizeC, sizeZ, sizeY, sizeX] = zarr_arr.shape;

  const dtypes = {
    "|i1": "int8",
    "|u1": "uint8",
    "<i2": "int16",
    "<u2": "uint16",
    "<i4": "int32",
    "<u4": "uint32",
    "<f4": "float32",
    "<f8": "float64"
  };

  const startX = config.offsetX || 0;
  const endX = config.sizeX ? config.sizeX + startX : sizeX;
  const startY = config.offsetY || 0;
  const endY = config.sizeY ? config.sizeY + startY : sizeY;

  if (!config.sizeX && !config.sizeY && sizeX * sizeY > 50000 * 50000) {
    throw new Error(
      "The image size exceeded the limit, please specify sizeX and sizeY explicitly."
    );
  }

  return {
    _rintf: true, // make sure getSlice can be called multiple times
    name: config.name,
    dtype: dtypes[zarr_arr.dtype] || "uint16",
    width: endX - startX,
    height: endY - startY,
    nSlice: sizeC * sizeZ * sizeT,
    async getSlice(index) {
      const t = parseInt(index / (sizeC * sizeZ));
      const z = parseInt((index % (sizeC * sizeZ)) / sizeC);
      const c = parseInt(index % sizeC);
      // const d = await zarr_arr.getRawChunk([t, c, z, 0, 0]);
      const d = await zarr_arr.getRaw([
        t,
        c,
        z,
        zarrLib.slice(startY, endY),
        zarrLib.slice(startX, endX)
      ]);
      return d.data.buffer;
    },
    sizeC,
    sizeZ,
    sizeT
  };
}
