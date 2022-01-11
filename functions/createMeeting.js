const { default: axios } = require('axios')
const SQLquery = require('../DatabaseFunctions/executeDBquery')
const POST_TO_CLASS = require('../functions/POST_TO_CLASS')

const routineMeeting = () => {
    setInterval(()=> {
        const classs = fetch_classes()
        for(let i = 0;i < classs.length;i++){
            const link = create_meeting(classs[i].name, classs[i].webexToken, classs[i].time)

            if(link != ""){
                post_To_Class(classs[i].googleToken)
            }
        }

    }, 30 * 60 * 1000)
}

const fetch_classes = () => {
    let [classs, e_classs] = SQLquery(`CALL oneHour_classes;`);
    if(e_classs){
        console.log(e)
        return []
    }

    return classs
}

const create_meeting = (name, token, start) => {
    return new Promise((resolve, reject) =>{
        axios({
            url:'https://webexapis.com/v1/meetings',
            headers:{"Authrization": `Bearer ${token}`},
            body:{
                title: name,
                start: start,
                end: new Date(start) + 1000 * 60 * 45
            }
        }).then(res => {
            return res.data.wwebLink
        }).catch(error => {
            return ""
        })
    })  
}

const post_To_Class = (token,link)=> {
    const [posting, e_posting] = POST_TO_CLASS(token, link)
    if(e_posting){
        console.log(e)
    }
}