/**
 * Wraps an async function with error handling middleware.
 */
export const asyncWrapper = (fn) => {
    return async (req,res,next) => {
        try {
            await fn(req,res, next)   
        } catch (error) {
           next(error) 
        }
    } 
}