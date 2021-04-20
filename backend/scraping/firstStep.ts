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
  Kill: boolean = false;
  Routes: object = {
    outerRoutes: this.outerRoutes,
    idRoutes: this.idRoutes,
    innerRoutes: this.innerRoutes,
    pdfLinks: this.pdfLinks,
  };
  lim: number;
  constructor(url: string, lim: number) {
    this.url = url;
    this.lim = lim;
  }
  //   get the website Dom and store type of links and return them
  async initiate() {
    let d = await this.getDom(this.url, false, this.lim);
    // console.log(d);
    this.Kill = true;
    console.log("KOROSSEE");
    return {
      pdfLength: this.pdfLinks.length,
      pdfs: d ? d : this.pdfLinks,
      VisitedLinks: this.RoutesVisited.length,
      BrokenRoutes: this.BrokenRoutes.length,
    };
  }
  async getDom(url, re = false, limite = 400) {
    // return "Weee";
    // const response = await axios.get(url);
    if (this.pdfLinks.length >= limite) {
      this.Kill = true;
      return this.pdfLinks;
    }

    return axios
      .get(url, {
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        },
      })
      .then(async (response) => {
        const text = response.data;
        const dom = new beautifuldom(text);
        // const body = dom.getElementsByTagName("body")[0];
        const title = dom.getElementsByTagName("title");
        const aTag = dom.getElementsByTagName("a");
        const linkTag = dom.getElementsByTagName("link");
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
      })
      .catch(() => {
        this.RoutesVisited.push({ link: url, ALength: 0 });
        return false;
      });

    // return {
    //   title: title[0].innerText,
    //   aLength: aTag.length,
    //   linkLength: linkTag.length,
    // };
  }

  async parseInnerRoutes(root = false) {
    for (let i in this.innerRoutes) {
      if (this.Kill) {
        break;
      }
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

        // console.log(link);
        this.innerRoutes.splice(index, 1);
        // console.log(link);
        try {
          let roll = await this.getDom(link, true);

          if (await roll) {
            console.log(`PARSING[${i}] ${link} D=${d}`);
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
    } else {
      setTimeout(() => console.log("Key"), 1000);
    }
  }
}
