const router = require("../src/routes/job.routes");
console.log("router.stack length", router.stack.length);
router.stack.forEach((layer) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
    console.log(methods, layer.route.path);
  } else {
    console.log("layer", layer.name);
  }
});
