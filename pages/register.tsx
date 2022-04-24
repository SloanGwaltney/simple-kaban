import { Fragment, useState } from "react";
import { FieldError, SubmitHandler, useForm, UseFormRegisterReturn } from "react-hook-form";
import { object, string } from "yup";
import { createAsyncResult } from "../lib/util";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";

export const schema = object({
	username: string().min(3).max(32).required(),
	email: string().email().required(),
	password: string().min(12).max(64).required()		
}).required()

type FormInputs = {
	username: string,
	email: string,
	password: string
}

function getFormClass(error: FieldError | undefined): string {
	return `form-control ${error ? 'is-invalid' : ''}`
}

function getFeedback(error: FieldError | undefined) {
	return (
		<Fragment>
			{error ? <div className="invalid-feedback">{error.message}</div> : null}
		</Fragment>
	)
}

export default function Register() {
	const { register, handleSubmit, setError, formState: { errors } } = useForm<FormInputs>({resolver: yupResolver(schema)})
	const [topError, setTopError] = useState<string | undefined>()
	const router = useRouter()
	async function onSubmit(data: any) {
		const [res, err] = await createAsyncResult(fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/users/register`, {body: JSON.stringify(data), method: 'post', headers: new Headers({'Content-Type': 'application/json'})}))
		if (!res || err) return setTopError('An unexpected error has occurred please try again in a few minutes')
		if (res.status === 201) return router.push('/registered')
		const [body, parseErr] = await createAsyncResult(res.json())
		if (parseErr) return setTopError('An unexpected error has occurred please try again in a few minutes')
		if (res.status === 422) {
			body.error.validationErrors.forEach((err: SimpleKanbanAPI.APIValidationError) => {
				if (err.path === 'username' || err.path === 'email' || err.path === 'password') {
					setError(err.path, {message: err.message})
				}
			})
		}
	}
	

	return (
		<div>
			{topError ? (<div className="alert alert-danger" role="alert">{topError}</div>) : null}
			<form className="needs-validation" onSubmit={handleSubmit(onSubmit)}>
				<div className="form-group">
					<label className="form-label" htmlFor="username">Username</label>
					<input className={getFormClass(errors.username)} id="username" {...register("username")} />
					{getFeedback(errors.username)}
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="email">Email</label>
					<input className={getFormClass(errors.email)} id="email" {...register("email")}/>
					{getFeedback(errors.email)}
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="password">Password</label>
					<input className={getFormClass(errors.password)} id="password" {...register("password")}/>
					{getFeedback(errors.password)}
				</div>
				<button onClick={handleSubmit(onSubmit)}>Submit</button>
			</form>
		</div>
	)
}