import { deleteFile } from './removeFile.utils.js'


export const ApiError = (message, statusCode) => {
    const error = new Error(message)
    error.statusCode = statusCode
    error.success = false
    return error
}

export const asyncHandler = (fn, name = 'UnknownController') => {

    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error(`🔥 Error in ${name} : ${err.message}`)
            if (req.file?.filename) deleteFile(req.file?.path)
            if (req.files && req.files?.length > 0) req.files?.forEach(file => deleteFile(file.path))
            next(err)
        })
    }
}

export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // For API requests (JSON response)
    return res.status(statusCode).json(
        {
            success: false,
            message: err.message || 'Something went wrong',
        }
    )
}

