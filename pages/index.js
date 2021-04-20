import Head from "next/head";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [inpt, setinpt] = useState();
  const [lim, setLim] = useState();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [curr, setCurr] = useState();
  const handleReq = async () => {
    setLoading(true);
    setData();
    const res = await fetch(`/api/hello?url=${inpt}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };
  const handlecloc = () => {
    let datax = new Date();
    let m = datax.getMinutes();
    let h = datax.getHours();
    let s = datax.getSeconds();
    setCurr(`${h}:${m}:${s}`);
  };
  useEffect(() => {
    setInterval(handlecloc, 1000);
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>Scrapix</h1>
        <a href="#">HRef #</a>
        <a href="/about">HRef #</a>
        <a href="/">HRef /</a>
        <a href="/something">HRef /something</a>
        <a href="https://wwww.anothersite.com/something">
          HRef https://wwww.anothersite.com/something
        </a>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReq();
            }}
          >
            <input
              value={lim}
              onChange={(e) => setLim(e.target.value)}
              type="text"
              placeholder="Limite default 400"
            />
            <input
              value={inpt}
              onChange={(e) => setinpt(e.target.value)}
              type="text"
              placeholder="https://exemple.com/"
            />
            <input type="submit" />
          </form>
          {curr}
          <div>{loading && <span>Loading ...</span>}</div>
        </div>
        <div>
          {data && (
            <div>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
