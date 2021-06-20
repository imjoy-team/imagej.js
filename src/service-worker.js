importScripts("./assets/js/sww.js");
var worker = new self.ServiceWorkerWare();
worker.use(new self.SimpleOfflineCache("offline"));
worker.init();
