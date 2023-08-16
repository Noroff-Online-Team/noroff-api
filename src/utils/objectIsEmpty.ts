/**
 *  Check if object is empty
 * @param obj  Object to check
 * @returns  Boolean
 */
export function objectIsEmpty(obj: Record<string, unknown>): boolean {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}
