const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");

const files = [
  "src/css/base/reset.css",
  "src/css/base/variables.css",
  "src/css/base/global.css",
  "src/css/components/header.css",
  "src/css/components/search-bar.css",
  "src/css/components/loading.css",
  "src/css/components/card.css",
  "src/css/pages/index.css",
  "src/css/pages/pokedex.css",
  "src/css/pages/pokemon.css",
];

const combinedCss = files.map((file) => fs.readFileSync(path.join(__dirname, "..", file), "utf-8")).join("\n");

const { styles } = new CleanCSS({ level: 2 }).minify(combinedCss);

fs.writeFileSync(path.join(__dirname, "..", "src/css/style.min.css"), styles);
