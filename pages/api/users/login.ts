import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { ironOptions } from "../../../lib/config";
import { createAsyncResult, JSON500Body } from "../../../lib/util";

export default withIronSessionApiRoute(handler, ironOptions)

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleKanbanAPI.APIResponse<null>>
) {
	if (!req.body.username) return res.status(422).json({_isError: true, error: {validationErrors: [{message: 'username is required', path: 'username'}]}});
	if (!req.body.password) return res.status(422).json({_isError: true, error: {validationErrors: [{message: 'password is required', path: 'password'}]}});

	const client = new PrismaClient()
	
	const [user, err] = await createAsyncResult(client.user.findUnique({where: {username: req.body.username}, rejectOnNotFound: true}))
	if (err || !user) {
		// Prisma does not throw a error object for this sadly
		if (err.message === 'No User found') return res.status(400).json({_isError: true, error: {message: 'Invalid Username or Password'}})
		return res.status(500).json(JSON500Body)
	}

	req.session = {user: {username: req.body.username}}

	const [values, error] = await createAsyncResult(Promise.all([compare(req.body.password, user.password), req.session.save()]))
	if (error || !values) return res.status(500).json(JSON500Body)
	if (values[0] === false) return res.status(400).json({_isError: true, error: {message: 'Invalid Username or Password'}})
	
	return res.status(201).json({_isError: false})
}