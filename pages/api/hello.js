// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { crunch } from "../../backend/scraping/crunching";

export default async (req, res) => {
  const app = await new crunch(req.query.url);
  console.log(await app.wo(req.query.url));
  res.status(200).json({ name: "John Doe" });
};
