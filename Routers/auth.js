const redirectHome = (req, res, next) => {
    try {
        if (req.session.userId && req.session.userId > 0) {
            return res.redirect('/dashboard')
        }

        next()
    } catch (e) {
        console.log(e)
        req.flash('error_msg', [{
            msg: "Internal server error, we are on our way to fix."
        }])
        res.redirect('/')
    }
}

const redirectLogin = async (req, res, next) => {
    try {

        if (!req.session.userId || req.session.userId < 0) {
            req.session.userId = null

            req.flash('error_msg', [{
                msg: "Please login to access this page."
            }])
            return res.redirect('/')
        }

        next()
    } catch (e) {
        console.log(e)
        req.flash('error_msg', [{
            msg: "Internal server error, we are on our way to fix."
        }])
        res.redirect('/')
    }
}

module.exports = {redirectHome, redirectLogin}