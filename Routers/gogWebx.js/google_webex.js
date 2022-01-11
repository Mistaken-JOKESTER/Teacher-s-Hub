const router = require('express').Router()
const {Google_codeToToken, Google_loginUrl} = require('../../google_webex/googleFunctions')
const {Webex_codeToToken, Webex_loginUrl} = require('../../google_webex/webexFunctions')
const SQLquery = require('../../DatabaseFunctions/executeDBquery')
const atob = require('atob')
const jwt = require('jsonwebtoken')

router.get('/google/auth/accepted', async (req, res) => {
    try{
        let { code, state } = req.query
        let {id, userEmail} = JSON.parse(state)
        id = Number(id)

        if(!code || !id || (Number(id)).toString() == 'NaN'){
            console.log(code, id)
            req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
            return res.redirect('/classes')
        }

        const [status, request_result] = await Google_codeToToken(code)
        if(!status){
            req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
            return res.redirect('/classes')
        } else {

            const decoded = JSON.parse(atob(request_result.id_token.split('.')[1]))

                console.log(decoded, userEmail)
                const {email, sub} =  decoded
                if(email !== userEmail){
                    req.flash('error_msg', [{msg:"Mail you provided and your google email does not match."}])
                    return res.redirect('/classes')
                }

                jwt.sign({ userId: id, refresh_token: request_result.refresh_token }, process.env.JST_SECRETE, async function(err, token) {
                    console.log(err, token)
                    const [result, status] = await SQLquery('Call updateToken(?, ?, ?);', [request_result.refresh_token, 1, id])
                    console.log(result)
                    if(status != 0){
                        req.flash('error_msg', [{msg :"We are not able to update your account info, please try again after sometime."}])
                        return res.redirect('/dashboard')
                    }

                    return res.redirect('/redirect?type=google&token=' + encodeURIComponent(token))
                })
                
                
                
        }
    } catch(e) {
        console.log(e)
        req.flash('error_msg', [{msg:"Sorry for this error, we are on our way to fix it."}])
    }
})

router.get('/webex/auth/accepted', async(req, res) => {
    try{
        let { code, state } = req.query
        console.log(req.query)
        let {id} = JSON.parse(state)
        id = Number(id)

        if(!code || !id || (Number(id)).toString() == 'NaN'){
            console.log('booo')
            console.log(code, id)
            req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
            return res.redirect('/classes')
        }

        const [status, request_result] = await Webex_codeToToken(code)
        console.log(status, request_result)
        if(!status){
            console.log('yo')
            req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
            return res.redirect('/classes')
        } else {

            req.session.userId = id
            var token = await jwt.sign({ userId: id }, process.env.JST_SECRETE);
             
            const [result, status] = await SQLquery('Call updateToken(?, ?, ?);', [request_result.refresh_token, 0, id])
            console.log(result)
            if(status != 0){
                req.flash('error_msg', [{msg :"We are not able to update your account info, please try again after sometime."}])
                return res.redirect('/classes')
            }

            return res.redirect('/redirect?type=webex&token=' + encodeURIComponent(token))
        }
    } catch(e) {
        console.log(e)
        res.send({msg:'error'})
    }
})

module.exports = router