import type { NextApiRequest, NextApiResponse } from "next";
import { gostart } from "../../backend/scraping/firstStep";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const u = await new gostart(req.query.url, parseInt(req.query.lim));
  //   await u.getDom();

  res.status(200).json(await u.initiate());
};
