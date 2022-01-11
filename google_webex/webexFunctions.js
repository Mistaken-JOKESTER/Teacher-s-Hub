const axios = require('axios')

const Webex_loginUrl = async (state) => {
    const redirect_uri = await encodeURI(process.env.WEBEX_REDIRECT_URL) 
    const url = `https://webexapis.com/v1/authorize?client_id=${process.env.WEBEX_CLIENT_ID}&response_type=code&redirect_uri=${redirect_uri}&scope=spark-admin%3Abroadworks_subscribers_write%20meeting%3Aadmin_preferences_write%20spark%3Aall%20meeting%3Aadmin_preferences_read%20analytics%3Aread_all%20meeting%3Aadmin_participants_read%20spark-admin%3Apeople_write%20spark-admin%3Aworkspace_metrics_read%20spark-admin%3Aplaces_read%20spark-compliance%3Ateam_memberships_write%20spark-compliance%3Amessages_read%20spark-admin%3Adevices_write%20spark-admin%3Aworkspaces_write%20spark-compliance%3Ameetings_write%20meeting%3Aadmin_schedule_write%20identity%3Aplaceonetimepassword_create%20spark-admin%3Aorganizations_write%20spark-admin%3Aworkspace_locations_read%20spark-compliance%3Awebhooks_read%20spark-admin%3Acall_qualities_read%20spark-compliance%3Amessages_write%20spark%3Akms%20meeting%3Aparticipants_write%20meeting%3Aadmin_transcripts_read%20spark-admin%3Apeople_read%20spark-compliance%3Amemberships_read%20spark-admin%3Aresource_groups_read%20meeting%3Arecordings_read%20meeting%3Aparticipants_read%20meeting%3Apreferences_write%20meeting%3Aadmin_recordings_read%20spark-admin%3Aorganizations_read%20spark-compliance%3Awebhooks_write%20meeting%3Atranscripts_read%20meeting%3Aschedules_write%20spark-compliance%3Ateam_memberships_read%20spark-admin%3Adevices_read%20meeting%3Acontrols_read%20spark-admin%3Ahybrid_clusters_read%20spark-admin%3Aworkspace_locations_write%20spark-admin%3Abroadworks_enterprises_write%20meeting%3Aadmin_schedule_read%20spark-admin%3Abroadworks_enterprises_read%20meeting%3Aschedules_read%20spark-compliance%3Amemberships_write%20spark-admin%3Aroles_read%20meeting%3Arecordings_write%20meeting%3Apreferences_read%20spark-admin%3Aworkspaces_read%20spark-admin%3Aresource_group_memberships_read%20spark-compliance%3Aevents_read%20spark-compliance%3Arooms_read%20spark-admin%3Aresource_group_memberships_write%20spark-admin%3Abroadworks_subscribers_read%20meeting%3Acontrols_write%20meeting%3Aadmin_recordings_write%20spark-admin%3Ahybrid_connectors_read%20audit%3Aevents_read%20spark-compliance%3Ateams_read%20spark-admin%3Aplaces_write%20spark-admin%3Alicenses_read%20spark-compliance%3Arooms_write&state=${encodeURIComponent(JSON.stringify(state))}`
    return url
}

const Webex_codeToToken = async (code) => {
    const redirect_uri = encodeURI(process.env.WEBEX_REDIRECT_URL)
    return new Promise((resolve, reject) => {
        axios({
            method:'POST',
            url: `https://webexapis.com/v1/access_token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data:`grant_type=authorization_code&client_id=${process.env.WEBEX_CLIENT_ID}&client_secret=${process.env.WEBEX_CLIENT_SECRETE}&code=${code}&redirect_uri=${redirect_uri}`
        }).then(response => {
            resolve([1, response.data])
        }).catch(error => {
            //console.log(error.response.data)
            resolve([0, error.response.data])
        })
    })
}

const Webex_refreshToken = (refresh_token) => {
    return new Promise((resolve, reject) => {
        axios({
            method:'POST',
            url: 'https://webexapis.com/v1/access_token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data:`client_id=${process.env.WEBEX_CLIENT_ID}&client_secret=${process.env.WEBEX_CLIENT_SECRETE}&refresh_token=${refresh_token}&grant_type=refresh_token`
        }).then(result => {
            resolve([1, response.data])
        }).catch(error => {
            //console.log(error.response.data)
            resolve([0, error.response.data])
        })
    })
}

module.exports = {Webex_loginUrl, Webex_codeToToken, Webex_refreshToken}