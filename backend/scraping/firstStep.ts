import beautifuldom from "beautiful-dom";
import axios from "axios";

// parsing links getting pdf links for download

export class gostart {
  url: string;
  outerRoutes: Array<any> = [];
  idRoutes: Array<any> = [];
  innerRoutes: Array<any> = [];
  pdfLinks: Array<any> = [];
  RoutesVisited: Array<any> = [];
  BrokenRoutes: Array<any> = [];
  Routes: object = {
    outerRoutes: this.outerRoutes,
    idRoutes: this.idRoutes,
    innerRoutes: this.innerRoutes,
    pdfLinks: this.pdfLinks,
  };
  constructor(url: string) {
    this.url = url;
  }
  //   get the website Dom and store type of links and return them
  async initiate() {
    let d = await this.getDom(this.url);
    // console.log(d);
    return {
      pdfs: await d,
      pdfLength: this.pdfLinks.length,
      VisitedLinks: this.RoutesVisited.length,
      BrokenRoutes: this.BrokenRoutes.length,
    };
  }
  async getDom(url, re = false) {
    // return "Weee";
    const response = await axios.get(url);
    const text = response.data;
    const dom = new beautifuldom(text);
    // const body = dom.getElementsByTagName("body")[0];
    const title = dom.getElementsByTagName("title");
    const aTag = dom.getElementsByTagName("a");
    const linkTag = await dom.getElementsByTagName("link");
    const totalElements = [...aTag, ...linkTag];
    if (re) {
      this.RoutesVisited.push({ link: url, ALength: aTag.length });
    }
    // console.log(totalElements.length);
    // await totalElements.map((d) => {
    //   if (d.getAttribute("href")) {
    //     if (d.getAttribute("href").includes(".pdf")) {
    //       // console.log(d.getAttribute("href").includes(".pdf"));
    //       this.pdfLinks.push(d.getAttribute("href"));
    //     }
    //     if (d.getAttribute("href")[0] === "/") {
    //       this.innerRoutes.push(d.getAttribute("href"));
    //     } else if (d.getAttribute("href").includes("http")) {
    //       if (d.getAttribute("href").includes(this.url)) {
    //         this.innerRoutes.push(d.getAttribute("href"));
    //       } else {
    //         this.outerRoutes.push(d.getAttribute("href"));
    //       }
    //     } else if (d.getAttribute("href").includes(".pdf")) {
    //       this.pdfLinks.push(d.getAttribute("href"));
    //     } else {
    //       this.idRoutes.push(d.getAttribute("href"));
    //     }
    //   }
    // });
    for (let i in totalElements) {
      let d = totalElements[i];
      if (d.getAttribute("href")) {
        if (
          d.getAttribute("href").includes(".css") ||
          d.getAttribute("href").includes("_next") ||
          d.getAttribute("href").includes(".png") ||
          d.getAttribute("href").includes(".ico") ||
          d.getAttribute("href").includes(".js")
        ) {
          continue;
        }
        if (d.getAttribute("href").includes(".pdf")) {
          this.pdfLinks.push(d.getAttribute("href"));
        } else if (d.getAttribute("href")[0] === "/") {
          this.innerRoutes.push(d.getAttribute("href"));
        } else if (d.getAttribute("href").includes("http")) {
          if (d.getAttribute("href").includes(this.url)) {
            this.innerRoutes.push(d.getAttribute("href"));
          } else {
            this.outerRoutes.push(d.getAttribute("href"));
          }
        } else {
          this.idRoutes.push(d.getAttribute("href"));
        }
      }
    }

    if (re) return true;
    let parsing = await this.parseInnerRoutes(true);
    return await parsing;

    // return {
    //   title: title[0].innerText,
    //   aLength: aTag.length,
    //   linkLength: linkTag.length,
    // };
  }

  async parseInnerRoutes(root = false) {
    for (let i in this.innerRoutes) {
      let d = this.innerRoutes[i];
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

        console.log(`PARSING[${i}] ${link} D=${d}`);
        // console.log(link);
        this.innerRoutes.splice(index, 1);
        // console.log(link);
        try {
          let roll = await this.getDom(link, true);

          if (await roll) {
            this.parseInnerRoutes();
          }
        } catch {
          this.BrokenRoutes.push(link);
          // console.log(`Error00[${i}] ${link}`);
        }
      }
    }
    // return { code: "yis", len: this.innerRoutes.length };
    // console.log(this.pdfLinks.length);
    console.log(
      "INNERROUTES",
      this.innerRoutes.length,
      this.innerRoutes.length <= 5 && this.innerRoutes,
      root
    );
    // return this.pdfLinks;
    if (this.innerRoutes.length == 0 && root) {
      // console.log(this.pdfLinks);
      return this.pdfLinks;
    }
  }
}
