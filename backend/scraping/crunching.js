import BeautifulDom from "beautiful-dom";

const jsdom = require("jsdom");
const fs = require("fs");
const axios = require("axios");

export class crunch {
  constructor(url) {
    this.url = url;
    this.host = new URL(url).host.includes(".")
      ? new URL(url).host.replace("www.", "").split(".")[0]
      : new URL(url).host.replace(":", "");

    this.pdfLinks = [];
    this.idRoutes = [];
    this.innerRoutes = [];
    this.outerRoutes = [];
    this.BrokenRoutes = [];
    this.RoutesVisited = [];
    this.crunch = {
      url: this.url,
      pdfs: this.pdfLinks,
      innerRoutes: this.innerRoutes,
    };
  }

  async wo(url, root = false) {
    const response = await axios.get(url);
    const { JSDOM } = jsdom;
    const text = response.data;
    const dom = new JSDOM(`${text}`);

    if (root) {
      this.RoutesVisited.push({ link: url });
    }
    const totalElements = dom.window.document.querySelectorAll("[href]");
    for (let i in totalElements) {
      let d = totalElements[i].href;
      if (d) {
        if (
          d.includes(".css") ||
          d.includes("_next") ||
          d.includes(".png") ||
          d.includes(".ico") ||
          d.includes(".js")
        ) {
          continue;
        }
        if (d.includes(".pdf")) {
          this.pdfLinks.push(d);
        } else if (d[0] === "/") {
          this.innerRoutes.push(d);
        } else if (d.includes("http")) {
          if (d.includes(this.url)) {
            this.innerRoutes.push(d);
          } else {
            this.outerRoutes.push(d);
          }
        } else {
          this.idRoutes.push(d);
        }
      }
    }
    await this.parseRoute();
    if (root) {
      return true;
    }
    let nData = { site: this.host, pdfs: this.pdfLinks };
    fs.readFile(
      "public/static/sites.json",
      function readFileCallback(err, data) {
        if (err) {
          console.log(err);
        } else {
          let obj = JSON.parse(data);

          obj.sites.push(nData);
          let json = JSON.stringify(obj);
          fs.writeFile("public/static/sites.json", json, () =>
            console.log("SAVED")
          );
        }
      }
    );
    return {
      numberofPdfs: this.pdfLinks.length,
      ...this.crunch,
    };
  }
  async parseRoute() {
    for (let i in this.innerRoutes) {
      if (this.Kill) {
        break;
      }
      let d = this.innerRoutes[i];
      try {
        this.innerRoutes.splice(this.innerRoutes.indexOf("/"), 1);
      } catch {}
      if (d != "/") {
        let index = this.innerRoutes.indexOf(d);
        let link;
        if (d.includes("http")) {
          link = d;
        } else {
          link = `${this.url}${d[0] == "/" ? d.substring(1) : d}`;
        }
        if (link.includes("vhttps")) {
          link = link.substring(1);
        }
        let visited = false;
        for (let r in this.RoutesVisited) {
          if (this.RoutesVisited[r].link == link) {
            visited = true;
            console.log(`Visited[${i}] ${link}`);
            break;
          }
        }
        if (visited) {
          this.innerRoutes.splice(index, 1);
          continue;
        }

        this.innerRoutes.splice(index, 1);
        try {
          let roll = await this.wo(link, true);

          if (await roll) {
            console.log(`PARSING[${i}] ${link} D=${d}`);
            this.parseInnerRoutes();
          }
        } catch {
          this.BrokenRoutes.push(link);
        }
      }
    }
  }
}
