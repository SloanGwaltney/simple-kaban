import { useState } from "react";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { createAsyncResult } from "../lib/util";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { getFormClass, getFormFeedback, isNonUserApiError } from "../lib/Form";
import { ApiClient, ConflictError, ValidationResponseError } from "../lib/apiClinet";

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

export default function Register() {
	const { register, handleSubmit, setError, formState: { errors } } = useForm<FormInputs>({resolver: yupResolver(schema)})
	const [topError, setTopError] = useState<string | undefined>()
	const router = useRouter()
	async function onSubmit(data: any) {
		const client = new ApiClient()
		client.requestBuilder.users().register().post(data)
		const [body, err] = await createAsyncResult(client.runRequest<string>())
		if (err) {
			if (isNonUserApiError(err)) return setTopError('An unexpected error has occurred please try again in a few minutes')
			if (err instanceof ValidationResponseError) return err.validationErrors.forEach((valErr) => {
				// TODO: Find a way to not have to define each key
				if (valErr.path === 'username' || valErr.path === 'email' || valErr.path === 'password') return setError(valErr.path, {message: valErr.message})
			})
			if (err instanceof ConflictError) return setTopError(err.conflictReason)
		}
		router.push('/registered')
	}
	

	return (
		<div>
			{topError ? (<div className="alert alert-danger" role="alert">{topError}</div>) : null}
			<form className="needs-validation" onSubmit={handleSubmit(onSubmit)}>
				<div className="form-group">
					<label className="form-label" htmlFor="username">Username</label>
					<input className={getFormClass(errors.username)} id="username" {...register("username")} />
					{getFormFeedback(errors.username)}
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="email">Email</label>
					<input className={getFormClass(errors.email)} id="email" {...register("email")}/>
					{getFormFeedback(errors.email)}
				</div>
				<div className="form-group">
					<label className="form-label" htmlFor="password">Password</label>
					<input className={getFormClass(errors.password)} id="password" {...register("password")}/>
					{getFormFeedback(errors.password)}
				</div>
				<button className="btn btn-primary" onClick={handleSubmit(onSubmit)}>Submit</button>
			</form>
		</div>
	)
}