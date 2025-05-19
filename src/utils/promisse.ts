/**
 * Returns a promise that resolves to `true` if the given status is 'fulfilled',
 * otherwise it rejects with `false`.
 *
 * @param {string} status - The status to check.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the status is 'fulfilled',
 *                             otherwise it rejects with `false`.
 */
/**
 * Checks if the given promise status is 'fulfilled'.
 *
 * @param {string} status - The status of the promise.
 * @returns {boolean} - Returns `true` if the status is 'fulfilled', otherwise `false`.
 */
const promisseStatus = (status: string): boolean => {
    return status === 'fulfilled' ? true : false;
};

export { promisseStatus };