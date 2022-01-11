const router = require('express').Router()
const SQLquery = require('../../DatabaseFunctions/executeDBquery')
const bcrypt = require('bcryptjs')
const { redirectHome } = require('../auth')

router.get('/', redirectHome, (req, res) => {
    try{
        const error_msg = req.flash('error_msg')
        const success_msg = req.flash('success_msg')
        const reg_data = req.flash('reg_data')[0] || {}
        const login_data = req.flash('login_data')[0] || {}

        if (req.session.type == "admin" && req.session.logged_in) {
            return res.redirect('/dashboard')
        }

        pool.getConnection((err, connection) => {
        //checking if any errors
            if (err) {
                console.log(err)
                error_msg.push({
                    msg: 'Failed to connect to services'
                })

                return res.render('Welcome', {
                    error_msg,
                    success_msg
                })
            }

            connection.release()
            res.render('welcome', {
                error_msg,
                success_msg,
                reg_data,
                login_data
            })

        })
    } catch(err) {
        console.log(err)
        res.render('Welcome', {
            error_msg: [{msg:'Server are down right now, some features may not work.'}]
        })
    }
})

router.post('/register', async (req, res) => {
    try{
        const {email, name, password, mobile} = req.body

        const errors = []
        if(!email || typeof email !== 'string' || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            errors.push({msg:"Email is not valid."})
        } else {
            const [exesist, exesist_e] = await SQLquery('SELECT id FROM teacher WHERE email = ?;', [email])
            if(exesist_e != 0){
                errors.push({msg:"We not able to verify your email to database right now, please try againg after sometime."})
            } else {
                if(exesist.length != 0)
                errors.push({msg:"Given email is already in use."})
            }
        }
        if(!name || typeof name !== 'string' || name.length > 60){
            errors.push({msg:"Name should have alteast one and at most 60 characters."})
        }
        if(!password || typeof password !== 'string' || password.length < 8 || password.length > 16){
            errors.push({msg:'Password must have atleast 8 characters and less than 15.'})
        }
        if(!mobile || mobile.length !== 10){
            errors.push({msg:'Invalid mobile number.'})
        }

        if(errors.length){
            req.flash('error_msg', errors)
            req.flash('reg_data', [{email, name, password, mobile}])
            return res.redirect('/')
        }

        console.log([{email, name, password, mobile}])
        const newpassword = password//bcrypt.hashSync(password, process.env.SALT)
        const [result, error] = await SQLquery('CALL addNewTeacher(?,?,?,?);', [name, email, newpassword, mobile])

        if(error !== 0){
            req.flash('error_msg', [{msg:'Falied to create your account.'}])
            req.flash('reg_data', [{email, name, password, mobile}])
            return res.redirect('/')
        }

        req.flash('success_msg', [{msg:'Welcome on board, your account is created.'}])
        res.redirect('/')
    } catch (e){
        console.log(e)
        const {email, name, password, mobile} = req.body
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        req.flash('reg_data', [{email, name, password, mobile}])
        res.redirect('/')
    }
})

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body

        const errors = []
        if(!email || typeof email !== 'string' || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            errors.push({msg:"Given Credentials are not valid"})
        }
        if(!password || typeof password !== 'string' || password.length < 8 || password.length > 16){
            errors.push({msg:'Given Credentials are not valid'})
        }

        if(errors.length){
            req.flash('error_msg', errors)
            req.flash('login_data', [{email}])
            return res.redirect('/')
        }

        let msg = ''

        const [exesist, exesist_e] = await SQLquery('SELECT id, name, password FROM teacher WHERE email = ?;', [email])

        if(exesist_e != 0){
            msg = "We not able to verify your email to database right now, please try again after sometime."
        } else if(exesist.length == 0){
                msg="Given Credentials are not valid"
        } else {
            const compare = password.toString() == exesist[0].password.toString()//await bcrypt.compareSync(password, exesist[0].password.toString())
            if(!compare){
                msg="Given Credentials are not valid"
            }
        }

        if(msg !== ''){
            req.flash('error_msg', [{msg}])
            req.flash('login_data', [{email}])
            return res.redirect('/')
        }

        req.session.userId = exesist[0].id
        res.redirect('/classes')
    } catch (e){
        console.log(e)
        const {email, name, password, mobile} = req.body
        req.flash('error_msg', [{msg:"Internal server error, please try again."}])
        req.flash('reg_data', [{email, name, password, mobile}])
        res.redirect('/classes')
    }
})

module.exports = router