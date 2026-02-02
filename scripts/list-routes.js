const app = require("../src/app");

function printRoutes(stack, base) {
  stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      console.log(`${methods} ${base}${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      const newBase =
        base +
        layer.regexp.source
          .replace("^\\", "")
          .replace("\\/?(?=\\/|$)", "")
          .replace("(?:\\/)?", "");
      printRoutes(layer.handle.stack, newBase);
    }
  });
}

if (!app || !app._router) {
  console.error("App or router not found");
  process.exit(1);
}

printRoutes(app._router.stack, "");
