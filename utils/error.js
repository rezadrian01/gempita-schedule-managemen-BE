exports.errResponse = (msg = 'An Error Occured', statusCode = 500, data = []) => {
    const err = new Error(msg);
    err.statusCode = statusCode;
    err.data = data
    throw err
}