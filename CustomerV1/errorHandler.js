function returnErrorResponse (response, status, message) {
    response.writeHead(status, { "Content-type": "text/plain" })
    response.write(message)
    response.end()
}

module.exports.returnError = returnErrorResponse;