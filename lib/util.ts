import { ValidationError } from "yup"

export async function createAsyncResult<T>(promise: Promise<T>): Promise<[T | null, any | null]> {
	try {
		const data = await promise
		return [data, null]
	} catch (e) {
		return [null, e]
	}
}

export const JSON500Body = {
	_isError: true,
	error: 'A unexpected internal service error has occurred please try again in a few minutes'
}

export function createValidationErrorBody(err: ValidationError) {
	return {_isError: true, error: {validationErrors: err.inner.map((val) => ({message: val.message, path: val.path}))}}
}