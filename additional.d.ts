namespace SimpleKanbanAPI {
	declare interface APIResponse<T> {
		_isError: boolean,
		error?: any,
		data?: T
	}
	declare type APIValidationError = {
		message: string,
		path: string
	}
}

declare module "iron-session" {
  interface IronSessionData {
    user?: {
		username?: string
    };
  }
}