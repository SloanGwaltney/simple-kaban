export const ironOptions = {
	cookieName: process.env.COOKIE_NAME as string,
	password: process.env.COOKIE_PASSWORD as string,
	cookieOption: {
		// If we do not have a USE_HTTP env var then default to HTTPS, otherwise check the USE_HTTP var
		secure: process.env.USE_HTTP ? false : process.env.USE_HTTP?.toLocaleLowerCase() == 'true' ? true : false
	}
}