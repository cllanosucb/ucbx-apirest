const error = (data) => {
    return {
        ok: false,
        error: data
    }
}

const success = (data) => {
    return {
        ok: true,
        data
    }
}

module.exports = {
    error,
    success
}