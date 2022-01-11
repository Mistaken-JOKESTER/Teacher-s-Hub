const axios = require('axios')

const CreateClassroom = async (body, access_token) => {
    return new Promise((reject, resolve) => {
        axios({
            method:'post',
            url:'https://classroom.googleapis.com/v1/courses/',
            headers:{
                'Authorization':`Bearer ${access_token}`
            },
            data:body
        }).then(result => {
            console.log(...result.data)
            axios({
                method:'put',
                url:'https://classroom.googleapis.com/v1/courses/' + result.body.id,
                headers:{
                    'Authorization':`Bearer ${access_token}`
                },
                data:{...result.body, courseState: "ACTIVE"}
            }).then(result1 => {
                console.log(result1.data)
                [0, 0]
            }).catch(error1 => {
                console.log(error1.response || error1)
                return [0, 0]
            })
        }).catch(error => {
            console.log(error.response || error)
            return [0, 0]
        })
    })
}