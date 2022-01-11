const { Google_refreshToken } = require('../google_webex/googleFunctions')
const SQLquery = require('../DatabaseFunctions/executeDBquery')
const axios = require('axios')
const GET = require('./GetReq')
const POST = require('./PostReq')
const PUT = require('./PutReq')

const fetchClasses = async (refresh_token) => {
    const [token_e, token] = await Google_refreshToken(refresh_token)

    if(token_e){
        return [1, [{msg:"Your google account is linked but we are not able to access data form your classroom please, sign in again."}]]
    }

    const [classes_e, classes] = await GET({'Authorization': `Bearer ${token.access_token}`}, {teacherId:'me'},'https://classroom.googleapis.com/v1/courses')

    if(classes_e){
        return [1, [{msg:"Your google account is linked but we are not able to access data form your classroom please, sign in again."}]]
    }

    return [0, classes]
}

const createClass = async (refresh_token, data, userId) => {
    const [token_e, token] = await Google_refreshToken(refresh_token)

    if(token_e){
        return [1, [{msg:"Your google account is linked but we are not able to access data form your classroom please, sign in again."}]]
    }

    const [classs_e, classs] = await POST(data, {'Authorization': `Bearer ${token.access_token}`},{},'https://classroom.googleapis.com/v1/courses')

    if(classs_e){
        return [1, [{msg:"We are unable to create a classroom right now."}]]
    }

    const [addClass, addClass_e] = await SQLquery(`Insert into class value (?,?,?,?,?,?,?,?,?,?,?,?);`, [classs.id, classs.name, classs.section, classs.descriptionHeading, classs.description, classs.enrollmentCode,classs.alternateLink, classs.teacherGroupEmail, classs.courseGroupEmail, userId, classs.ownerId, 0])

    if(addClass_e){
        deleteClass(classs.id, {'Authorization': `Bearer ${token.access_token}`})
        return [1, [{msg:"Failed to update class in your database."}]]
    }

    const [accept_e, accept_class] = await PUT({...classs, "courseState": "ACTIVE"}, {'Authorization': `Bearer ${token.access_token}`},{},'https://classroom.googleapis.com/v1/courses/' + classs.id)

    if(accept_e){
        return [1, [{msg:"Your class is created, but you need to accept it in google classroom"}]]
    }

    return [0, [{msg:"Your class is created, successfully."}]]
}

const deleteClass = async (id, headers) => {
    try {
        const response = await axios({
            method:'delete',
            url:`https://classroom.googleapis.com/v1/courses/${id}`,
            headers
        })
        console.log(response);
      } catch (error) {
        console.error(error.response.data);
      }
}

module.exports = {fetchClasses, createClass}