import { isErrorDetail } from "@shared/types/utility.types.ts";
import type { ErrorDetail } from "@shared/types/utility.types";

export function isError<T> (value:T): value is T & ErrorDetail {
    return isErrorDetail(value)
}