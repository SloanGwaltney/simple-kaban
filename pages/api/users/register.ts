import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse } from '../../../lib/types';
import joi from 'joi';
import { createAsyncResult, createResult } from '../../../lib/util';
import { hash } from 'bcryptjs';
import { create500ErrorMessage } from '../../../lib/errors';
import { PrismaClient, User } from '@prisma/client';
import { sign } from 'jsonwebtoken';

interface Res extends ApiResponse<{token: string}> {}

const registerSchema = joi.object({
    username: joi.string().required().min(3).max(64),
    email: joi.string().required().email(),
    password: joi.string().required().min(8).max(64)
}).required()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Res>
  ) {
        const client = new PrismaClient();
    
        const {error: validationError} = await createAsyncResult(registerSchema.validateAsync(req.body));
        if (validationError) return res.status(422).json({_isError: true, error: validationError})

        const {value: hashPass, error: hashErr} = await createAsyncResult(hash(req.body.password, 10));
        if (hashErr) return res.status(500).json({_isError: true, error: create500ErrorMessage()});
        req.body.password = hashPass;

        const {value: savedUser, error: saveError} = await createAsyncResult(client.user.create({data: req.body}));
        if (saveError.code === 'P2002') return res.status(400).json({_isError: true, error: 'Username or email already in use'})
        if (saveError || !savedUser) return res.status(500).json({_isError: true, error: create500ErrorMessage()});

        const {value: token, error: tokenErr} = createResult<string>(sign, [{id: savedUser.id}, process.env.JWT_KEY as string, {expiresIn: '24h'}]);
        if (tokenErr || !token) return res.status(500).json({_isError: true, error: create500ErrorMessage()});
        
        res.status(201).json({_isError: false, data: {token}});
  }