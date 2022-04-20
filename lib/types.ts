export interface ApiResponse<T> {
    _isError: boolean
    error?: any
    data?: T
}

export interface Result<T> {
    value?: T
    error?: any
}