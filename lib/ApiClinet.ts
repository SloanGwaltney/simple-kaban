import { createAsyncResult } from "./util";

class RequestBuilder {
	private root = process.env.NEXT_PUBLIC_API_ROOT as string
	private _url: string
	private method: string
	private data: any

	constructor() {
		this._url = this.root;
		this.method = ''
	}

	get url() {return this._url}

	public users() {
		this._url += '/users'
		
		function register(this: RequestBuilder) {
			this._url += '/register'
			return this
		}

		function login(this: RequestBuilder) {
			this._url += '/login'
			return this
		}

		function logout(this: RequestBuilder) {
			this._url += '/logout'
			return this
		}

		return {
			register: register.bind(this),
			login: login.bind(this),
			logout: logout.bind(this)
		}
	}

	public post(data: any) {
		this.method = 'post'
		this.data = data
	}

	public callApi(headers?: {[key: string]: string}) {
		return fetch(this._url, {method: this.method, headers: new Headers({'Content-Type': 'application/json', ...headers}), body: JSON.stringify(this.data)})
	}
}

export class RequestFailedError extends Error {
	constructor(e: any, path: string) {
		super(`The network request to "${path}" failed with this error message: ${e.message}`)
	}
}

export class NoDataError extends Error {
	constructor(path: string) {
		super(`The network request to "${path}" returned no data or status`)
	}
}

export class InternalServiceError extends Error {
	constructor(path: string) {
		super(`The network request to "${path}" returned a 500 status error`)
	}
}

export class UnexpectedResponseFormat extends Error {
	constructor(path: string) {
		super(`The network request to "${path}" returned a response body in a unexpected format`)
	}
}

export class UnexpectedResponseContent extends Error {
	constructor(path: string) {
		super(`The network request to "${path}" returned a response body that had unexpected content`)
	}
}

export class ValidationResponseError extends Error {
	public validationErrors: SimpleKanbanAPI.APIValidationError[];
	constructor(path: string, errors: SimpleKanbanAPI.APIValidationError[]) {
		super(`A invalid request was made to "${path}"`)
		this.validationErrors = errors
	}
}

export class ConflictError extends Error {
	conflictReason: string
	constructor(path: string, serverMessage: string) {
		super(`A conflict error was returned from the request to ${path}`)
		this.conflictReason = serverMessage
	}
}

export class UnexpectedError extends Error {
	constructor(path: string, code: number) {
		super(`The request to ${path} returned a unexpected status: ${code}`)
	}
}

export class ApiClient {
	private _requestBuilder = new RequestBuilder();
	get requestBuilder() {return this._requestBuilder}

	public async runRequest<T>() {
		console.log('ummmm')
		const [data, err] = await createAsyncResult(this.requestBuilder.callApi())
		if (err) throw new RequestFailedError(err, this.requestBuilder.url)
		if (!data) throw new NoDataError(this.requestBuilder.url)
		if (data.status === 500) throw new InternalServiceError(this.requestBuilder.url)
		const [body, parseErr] = await createAsyncResult(data.json())
		if (parseErr) throw new UnexpectedResponseFormat(this.requestBuilder.url)
		if (data.status >= 200 && data.status < 300) return body as T
		if (data.status === 422) {
			if (body.error.validationErrors) {
				throw new ValidationResponseError(this.requestBuilder.url, body.error.validationErrors)
			} else {
				throw new UnexpectedResponseContent(this.requestBuilder.url)
			}
		}
		if (data.status === 409) throw new ConflictError(this.requestBuilder.url, body.error.message)
		throw new UnexpectedError(this.requestBuilder.url, data.status);
	}
}