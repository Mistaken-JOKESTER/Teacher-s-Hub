const axios = require('axios')

const makeReq = (data, headers, params, url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios({
                method: 'post',
                url,
                data,
                headers,
                params
            })

            console.log(response.data)
            resolve([0, response.data])
        } catch (error) {
            console.log(error)
            resolve([1, error.response])
        }
    })
}

module.exports = makeReq