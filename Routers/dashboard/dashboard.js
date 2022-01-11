const { Google_loginUrl } = require('../../google_webex/googleFunctions')
const { redirectLogin } = require('../auth')
const SQLquery = require('../../DatabaseFunctions/executeDBquery')
const { Webex_loginUrl } = require('../../google_webex/webexFunctions')
const jwt = require('jsonwebtoken')
const { fetchClasses, createClass } = require('../../functions/classroom')
const router = require('express').Router()


router.get('/redirect', async (req, res) => {
    try{
        const {token, type} = req.query

        jwt.verify(token, process.env.JST_SECRETE, async function (err, decoded) {
            if(err){
                console.log("JWT error", err)
                req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
                return res.redirect('/classes')
            }
            
            console.log(decoded)

            if(!decoded.userId){
                req.flash('error_msg', [{msg:"Failed to process your request, Please try again."}])
                return res.redirect('/classes')
            }

            req.session.userId = decoded.userId
            req.flash('success_msg', [{msg:"Conguratalions, Your " + type + " account is linked successfully."}])
            res.redirect('/classes')
        })
    } catch(e) {
        console.log(e)
        res.send({msg:'error'})
    }
})

router.get('/dashboard', redirectLogin, async (req, res) => {
    try{
        const error_msg = req.flash('error_msg')
        const success_msg = req.flash('success_msg')

        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.redirect('/')
        }

        const gURL = await Google_loginUrl({id:req.session.userId, userEmail:exesist[0].email})
        const wURL = await Webex_loginUrl({id:req.session.userId})

        res.render('dashboard', {
            webex: wURL,
            google:gURL,
            user: exesist[0],
            error_msg,
            success_msg
        })
    } catch (e){
        console.log(e)
        const {email, name, password, mobile} = req.body
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        req.flash('reg_data', [{email, name, password, mobile}])
        res.redirect('/')
    }
})

router.get('/classes', redirectLogin, async (req, res) => {
    try{
        const error_msg = req.flash('error_msg')
        const success_msg = req.flash('success_msg')
        const classs = req.flash('classs')[0] || {}
        
        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.redirect('/')
        }
 
        console.log()
        const [classess, classess_e] = await SQLquery('SELECT id, name, section, tabled FROM class WHERE teacher_id = ?;', [userId])
        if(classess_e != 0){
            error_msg.push({msg:"Failed to fetch your classes, please refresh or try again."})
        } else if(classess.length == 0){
            success_msg.push({msg:"Create a new class."})
        }

        console.log(exesist)

        const gURL = await Google_loginUrl({id:req.session.userId, userEmail:exesist[0].email})
        const wURL = await Webex_loginUrl({id:req.session.userId})

        res.render('classes', {
            error_msg,
            success_msg,
            user: exesist[0],
            webex: wURL,
            google:gURL,
            name:classs.name, 
            section: classs.section, 
            discription_head: classs.discription_head, 
            discription: classs.discription,
            classess
        })
    } catch (e){
        console.log(e)
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        res.redirect('/classes')
    }
})

router.get('/class/:id', redirectLogin, async (req, res) => {
    try{
        const {id} = req.params
        if(!id || (Number(id)) == 'Nan'){
            req.flash('error_msg', [{msg:'Class not found.'}])
            return res.redirect('/classes')
        }

        const error_msg = req.flash('error_msg')
        const success_msg = req.flash('success_msg')
        
        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.redirect('/')
        }

        const [classess, classess_e] = await SQLquery('SELECT * FROM class WHERE id = ?; Select id, start_time, day from timetable where class_id = ?;', [id, id])
        if(classess_e != 0){
            error_msg.push({msg:"Failed to fetch your classes, please refresh or try again."})
        } else if(classess.length == 0){
            success_msg.push({msg:"Create a new class."})
        }

        if(!classess || classess[0].length == 0){
            req.flash('error_msg', [{msg:'Class not found.'}])
            return res.redirect('/classes')
        }

        const timetable = [[],[],[],[],[]]
        for (let z = 0; z < classess[1].length; z++) {
            const tt = classess[1][z];
            if(tt.day == 'mon'){
                timetable[0].push(tt)
            } else if(tt.day == 'tue'){
                timetable[1].push(tt)
            } else if(tt.day == 'wed'){
                timetable[2].push(tt)
            } else if(tt.day == 'thu'){
                timetable[3].push(tt)
            } else {
                timetable[4].push(tt)
            }
        }

        const gURL = await Google_loginUrl({id:req.session.userId, userEmail:exesist[0].email})
        const wURL = await Webex_loginUrl({id:req.session.userId})

        res.render('class', {
            error_msg,
            success_msg,
            user: exesist[0],
            webex: wURL,
            google:gURL,
            ...(classess[0][0]),
            timetable
        })
    } catch (e){
        console.log(e)
        const {email, name, password, mobile} = req.body
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        req.flash('reg_data', [{email, name, password, mobile}])
        res.redirect('/')
    }
})

router.post('/createClass', redirectLogin, async (req, res) => {
    try{
        const {name, section, discription_head, discription} = req.body
        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.redirect('/')
        }

        const errors = [{msg:'Failed to create class, fix these errors.'}]
        if(!name || typeof name != 'string'){
            errors.push({msg:'Name of class is required.'})
        } else if(name.length > 200){
            errors.push({msg:'Name cannot have more than 200 characters.'})
        }
        if(section && typeof section != 'string'){
            errors.push({msg:'Section of class is required.'})
        } else if(section && section.length > 100){
            errors.push({msg:'Section cannot have more than 100 characters.'})
        }
        if(!discription_head || typeof discription_head != 'string'){
            errors.push({msg:'Heading of class is required.'})
        } else if(discription_head && discription_head.length > 2000){
            errors.push({msg:'Heading cannot have more than 2000 characters.'})
        }
        if(discription && typeof discription != 'string'){
            errors.push({msg:'Discription of class is required.'})
        } else if(discription && discription.length > 4000){
            errors.push({msg:'Discription cannot have more than 4000 characters.'})
        }

        if(errors.length > 1) {
            req.flash('error_msg', errors)
            req.flash('classs', [{name, section, discription_head, discription}])
            return res.redirect('/classes')
        }

        const [createdClass_e, createdClass] = await createClass(exesist[0].googleToken, {name, section, descriptionHeading:discription_head, description:discription, ownerId:'me'}, req.session.userId)
        if(createdClass_e){
            req.flash('error_msg', createdClass)
            req.flash('classs', [{name, section, discription_head, discription}])
            return res.redirect('/classes')
        }

        req.flash('success_msg', createdClass)
        res.redirect('/classes')
    } catch (e) {
        console.log('error:', e)
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        res.redirect('/classes')
    }
})

router.post('/addClass/:id', redirectLogin, async (req, res) => {
    try{
        const {id} = req.params
        if(!id || (Number(id)) == 'Nan'){
            req.flash('error_msg', [{msg:'Class not found.'}])
            return res.send({error:1, red:'/classes'})
        }

        const {time, day} = req.body
        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.send({error:1, red:'/'})
        }

        const errors = [{msg:'Failed to add class to timetable, fix these errors.'}]
        if(!time || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)){
            errors.push({msg:'Invalid Time.'})
        } 
        if(!day || !['mon','tue','wed','thu','fri'].includes(day)){
            errors.push({msg:'Invalid day.'})
        } 

        if(errors.length > 1) {
            req.flash('error_msg', errors)
            return res.send({error:1, red:'/class/'+ id})
        }

        const [addClass, addClass_e] = await SQLquery('Insert into timetable(class_id, teacher_id, start_time, day) value (?,?,?,?); select id from timetable where teacher_id = ? and class_id = ? order by id desc limit 1;', [id.toString(), Number(userId), time, day, Number(userId), id])
        if(addClass_e){
            req.flash('error_msg', [{msg:"Failed to update class to database, please try again."}])
            return res.send({error:1, red:'/class/'+ id})
        }

        return res.send({
            id: addClass[1][0].id
        })
    } catch (e) {
        console.log('error:', e)
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        res.send({error:1, red:'/classes'})
    }
})

router.post('/removeClass/:class_id', redirectLogin, async (req, res) => {
    try{
        const {class_id} = req.params
        const userId = req.session.userId
        const [exesist, exesist_e] = await SQLquery('SELECT * FROM teacher WHERE id = ?;', [userId])

        let msg = ''
        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
            msg="Please login."
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.session.userId = null
            return res.send({error:1, red:'/'})
        }

        const errors = [{msg:'Failed to add class to timetable, fix these errors.'}]
        if(!class_id || (Number(class_id)) == 'Nan'){
            errors.push({msg:'Class not found'})
        } 

        if(errors.length > 1) {
            req.flash('error_msg', errors)
            return res.send({error:1, red:'/class/'+ id})
        }

        const [removeClass, removeClass_e] = await SQLquery('Delete from timetable where id = ? and teacher_id = ?;', [class_id, Number(userId)])
        if(removeClass_e){
            req.flash('error_msg', [{msg:"Failed to delete class from database, please try again."}])
            return res.send({error:1, red:'/class/'+ id})
        }

        return res.send({
            success:1
        })
    } catch (e) {
        console.log('error:', e)
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        res.send({error:1, red:'/classes'})
    }
})

router.get('/logout', redirectLogin, async(req, res) => {
    try{
        req.session.userId = null
        delete req.session.userId
        res.redirect('/')
    } catch(e){
        console.log(e)
        req.session.userId = null
        delete req.session.userId
        res.redirect('/')
    }
})

module.exports = router