import { NextApiRequest, NextApiResponse } from "next";
import {withIronSessionApiRoute} from 'iron-session/next'
import { ironOptions } from "../../../lib/config";
import { PrismaClient } from "@prisma/client";
import * as yup from 'yup';
import { hash } from "bcryptjs";
import { createAsyncResult, createValidationErrorBody, JSON500Body } from "../../../lib/util";

export default withIronSessionApiRoute(handler, ironOptions)

const yupSchema = yup.object({
	username: yup.string().required().min(3).max(32),
	email: yup.string().required().email(),
	password: yup.string().required().min(12).max(64)
})

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleKanbanAPI.APIResponse<null>>
) {
    if (!req.body.password) return res.status(422).json({_isError: true, error: {validationErrors: [{message: 'password is required', path: 'password'}]}});
	req.session = {user : {username: req.body.username}}

	const [results, err] = await createAsyncResult(Promise.all([yupSchema.validate(req.body, {abortEarly: false}), hash(req.body.password, 10), req.session.save()]))
	if (err || !results) {
		if (err instanceof yup.ValidationError) return res.status(422).json(createValidationErrorBody(err))
		return res.status(500).json(JSON500Body)
	}
	req.body.password = results[1]

	const client = new PrismaClient()
	const [_, saveErr] = await createAsyncResult(client.user.create({data: req.body}))
	if (saveErr) {
		req.session.destroy()
		if (saveErr.code === 'P2002') return res.status(409).json({_isError: true, error: {message: 'Username or email already in use'}})
		return res.status(500).json(JSON500Body)
	}
	return res.status(201).json({_isError: false})
}