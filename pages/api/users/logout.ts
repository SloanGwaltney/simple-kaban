import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironOptions } from "../../../lib/config";

export default withIronSessionApiRoute(handler, ironOptions)

function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleKanbanAPI.APIResponse<null>>
) {
	req.session.destroy()
	return res.status(200).json({_isError: false})
}