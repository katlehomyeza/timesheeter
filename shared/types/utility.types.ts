export type UUID = string;

export type ErrorDetail = {
    message: string,
    detail?: string
}
export function isErrorDetail<T>(value: T): value is T & ErrorDetail {
  return (
    value &&
    typeof value === 'object' && 
    'message' in value 
  );
}