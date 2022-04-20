import { Result } from "./types";

export async function createAsyncResult<T>(promise: Promise<T>): Promise<Result<T>> {
    try {
        const data = await promise
        return {value: data}
    } catch (e) {
        return {error: e}
    }
}

export function createResult<T>(func: Function, args: any[]): Result<T> {
    try {
        const value = func(...args) as T
        return {value}
    } catch (e) {
        return {error: e}
    }
}