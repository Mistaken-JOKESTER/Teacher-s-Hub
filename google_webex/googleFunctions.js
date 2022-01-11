const { google } = require('googleapis')
const axios = require('axios')

const googleAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRETE,
    process.env.GOOGLE_REDIRECT_URL
)

const Google_loginUrl = async (state) => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
        'https://www.googleapis.com/auth/classroom.announcements',
        'https://www.googleapis.com/auth/classroom.announcements.readonly',
        'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
        'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
        'https://www.googleapis.com/auth/classroom.courses',
        'https://www.googleapis.com/auth/classroom.guardianlinks.students',
        'https://www.googleapis.com/auth/classroom.profile.photos',
        'https://www.googleapis.com/auth/classroom.profile.emails',
    ]

    const url = await googleAuth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        state:JSON.stringify(state),
        redirect_uri: process.env.GOOGLE_REDIRECT_URL
    })
      
    return url
}

const Google_codeToToken = async (code) => {
    const redirect_uri = encodeURI(process.env.GOOGLE_REDIRECT_URL)
    const data = {
        code:code,
        client_id:process.env.GOOGLE_CLIENT_ID,
        client_secret:process.env.GOOGLE_CLIENT_SECRETE,
        redirect_uri:redirect_uri,
        grant_type:'authorization_code'
    }

    return new Promise((resolve, reject) => {
        axios({
            method:'POST',
            url: `https://oauth2.googleapis.com/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencode',
            },
            data:data
        }).then(response => {

            console.log(response.data)
            resolve([1, response.data])
        }).catch(error => {
            //console.log(error.response.data)
            resolve([0, error.response.data])
        })
    })
}

const Google_refreshToken = (refresh_token) => {
    return new Promise((resolve, reject) => {
        axios({
            method:'POST',
            url: 'https://oauth2.googleapis.com/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params:{
                client_id:process.env.GOOGLE_CLIENT_ID,
                client_secret:process.env.GOOGLE_CLIENT_SECRETE,
                refresh_token:refresh_token,
                grant_type:'refresh_token'
            }
        }).then(result => {
            resolve([0, result.data])
        }).catch(error => {
            console.log(error)
            resolve([1, error.response.data])
        })
    })
}

const Google_revokeToken = (refresh_token) => {
    return new Promise((resolve, reject) => {
        axios({
            method:'POST',
            url: `https://oauth2.googleapis.com/revoke?token=${refresh_token}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then(result => {
            resolve([1, response.data])
        }).catch(error => {
            //console.log(error.response.data)
            resolve([0, error.response.data])
        })
    })
}

module.exports = {Google_loginUrl, Google_codeToToken, Google_refreshToken, Google_revokeToken}