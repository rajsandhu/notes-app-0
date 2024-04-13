export const logger = (request, response, next) => {
    // console.log(
    //     new DataTransfer().tUTCString(),
    //     'Request from',
    //     request.ip,
    //     request.method,
    //     request.originalUrl
    // )
    console.log(`${request.method} ${request.url}`)
    next()
}