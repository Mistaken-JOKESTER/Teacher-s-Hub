const axios = require('axios')

const makeReq = (headers, params, url) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url,
            headers,
            params
        }).then((result) => {
            console.log(result.data)
            resolve([0, result.data])
        }).catch((err) => {
            console.log(err.response)
            resolve([1, err.response])
        })
    })
}
module.exports = makeReq