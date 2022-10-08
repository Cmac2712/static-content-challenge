const express = require("express");
const mustache = require("mustache");
const showdown = require("showdown");
const converter = new showdown.Converter();
const path = require("path");
const fs = require("fs");
const TEMPLATE_PATH = "/template.html";
const PAGES_DIR = `/content`;

/**
 * Get markdown file. Convert to HTML. Inject into template file and return.
 *
 * @param {string} fileURI  - path to the markdown file
 * @returns {string} - our page HTML
 */
function parsePage(fileURI, stylesURI) {
  const template = fs.readFileSync(
    path.join(__dirname) + TEMPLATE_PATH,
    "utf8"
  );

  const pageFile = fs.readFileSync(fileURI, "utf8");
  const styles = fs.readFileSync(stylesURI, "utf8");

  const renderedPage = converter.makeHtml(pageFile);

  const html = mustache.render(template, {
    styles,
    content: renderedPage,
  });

  return html;
}

const app = express();

app.use(express.static("src/public"));

/**
 * Match all routes
 */
app.get("/:path*", (req, res) => {
  // Get the path from the request
  const fileURI = path.join(
    __dirname,
    `${PAGES_DIR}/${req.params.path}${req.params[0]}/index.md`
  );
  const stylesURI = path.join(__dirname, `public/style.css`);

  // Check if the file exists and return a 404 if it doesn't
  if (!fs.existsSync(fileURI)) {
    res.status(404).send("Page Not Found!");
    return;
  }

  // Reesponse options
  const options = {
    root: path.join(__dirname),
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  // Parse the markdown file and inject it into the template and return
  res.send(parsePage(fileURI, stylesURI), options, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

module.exports = app;
