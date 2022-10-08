const request = require("supertest");
const app = require("./app");
const showdown = require("showdown");
const converter = new showdown.Converter();
const fs = require("fs");

const validURLs = [
  "/about-page",
  "/blog/june/company-update",
  "/jobs",
  "/valves",
  "/test",
  "/test/nested",
];

const invalidURLs = ["/invalid", "/404", "/about", "/blog?id=1"];

describe("Get correct HTTP codes in response", () => {
  validURLs.forEach((url) => {
    test(`GET ${url}`, () => {
      request(app)
        .get(url)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
        });
    });
  });
});

describe("Response contains the correct HTML parsed from the relevant .md doc", () => {
  validURLs.forEach((url) => {
    test(`GET ${url}`, () => {
      request(app)
        .get(url)
        .expect(200)
        .end((err, res) => {
          if (err) throw err;
          // Get returned HTML
          const html = res.text;
          // Get md file based of URL
          const md = fs.readFileSync(
            `${__dirname}/content/${res.req.path}/index.md`,
            "utf8"
          );
          // Compare rendered HTML from the .md file to HTML returned from server
          expect(html).toContain(converter.makeHtml(md));
        });
    });
  });
});

describe("Get correct HTTP codes in response for invalid URLs", () => {
  invalidURLs.forEach((url) => {
    test(`GET ${url}`, () => {
      request(app)
        .get(url)
        .expect(404)
        .end((err, res) => {
          if (err) throw err;
        });
    });
  });
});
