import { Fragment } from "react"
import { FieldError } from "react-hook-form"
import { InternalServiceError, NoDataError, RequestFailedError, UnexpectedError, UnexpectedResponseFormat } from "./apiClinet"

export function getFormClass(error: FieldError | undefined): string {
	return `form-control ${error ? 'is-invalid' : ''}`
}

export function getFormFeedback(error: FieldError | undefined) {
	return (
		<Fragment>
			{error ? <div className="invalid-feedback">{error.message}</div> : null}
		</Fragment>
	)
}

export function isNonUserApiError(err: any) {
	if (err instanceof NoDataError) return true
	if (err instanceof UnexpectedResponseFormat) return true
	if (err instanceof InternalServiceError) return true
	if (err instanceof UnexpectedError) return true
	if (err instanceof RequestFailedError) return true
	return false
}