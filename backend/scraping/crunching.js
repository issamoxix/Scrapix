import BeautifulDom from "beautiful-dom";

const axios = require("axios");

export class crunch {
  constructor(url) {
    this.url = url;
    this.pdfLinks = [];
    this.idRoutes = [];
    this.innerRoutes = [];
    this.outerRoutes = [];
  }

  async wo(url) {
    const response = await axios.get(url);
    const text = response.data;
    const dom = new BeautifulDom(text);
    const body = dom.getElementsByTagName("body")[0];
    const title = dom.getElementsByTagName("title");
    const aTag = body.getElementsByTagName("a");
    const linkTag = await body.getElementsByTagName("link");
    const totalElements = [...aTag, ...linkTag];

    await this.prosElements(totalElements);
  }
  async prosElements(elems) {
    // console.log(elems);
    await elems.map((d) => {
      if (d.getAttribute("href").includes(".pdf")) {
        // console.log(d.getAttribute("href").includes(".pdf"));
        this.pdfLinks.push(d.getAttribute("href"));
      }
      if (d.getAttribute("href")[0] === "/") {
        this.innerRoutes.push(d.getAttribute("href"));
      } else if (d.getAttribute("href").includes("http")) {
        if (d.getAttribute("href").includes(this.url)) {
          this.innerRoutes.push(d.getAttribute("href"));
        } else {
          this.outerRoutes.push(d.getAttribute("href"));
        }
      } else if (d.getAttribute("href").includes(".pdf")) {
        this.pdfLinks.push(d.getAttribute("href"));
      } else {
        this.idRoutes.push(d.getAttribute("href"));
      }
    });
    // console.log(this.innerRoutes.length);
    return await this.parseInnerRoutes();
  }
  async parseInnerRoutes() {
    // map through innerRoutes and get parse using the getDom func

    await this.innerRoutes.map(async (d) => {
      try {
        this.innerRoutes.splice(this.innerRoutes.indexOf("/"), 1);
      } catch {}
      if (d != "/") {
        // console.log({
        //   current: d,
        //   length: this.innerRoutes.length,
        //   routes: this.innerRoutes,
        // });
        let index = this.innerRoutes.indexOf(d);

        let link = `${this.url}${d[0] == "/" ? d.substring(1) : d}`;
        // console.log(link);
        this.innerRoutes.splice(index, 1);
        console.log("here", this.innerRoutes.length, link);
        // console.log(link);
        try {
          await this.wo(link);
        } catch {
          // console.log("ERROR 404");
        }
      }
    });
    // return { code: "yis", len: this.innerRoutes.length };
    // return console.log({ pdfs: this.pdfLinks });
    if (this.innerRoutes.length == 0) {
      //   console.log(this.pdfLinks);
      return this.pdfLinks;
    }
  }
}
