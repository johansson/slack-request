const rp = require("request-promise-native");
const debug = require("debug")("slack-request:lib:slack");
const config = require("../config");
const background = require("./background");
const db = require("./db");
const message = require("./message");

/// Send message to the Slack admins

const sendMessage = applicant => {
    var options = {
        method: "POST",
        uri: config.slack.hook,
        body: message.make(applicant),
        json: true,
    };

    return rp(options).then(body => {
        debug(`successfully pinged admins to process ${applicant.name} (${applicant.email})... body was ${JSON.stringify(body)}`);
    });
};

const send = async applicant => {
    var inserted = await db.insert(applicant);
    background(applicant, "notify admin of application", sendMessage);
    return inserted;
};

/// Actually invite the invitee to Slack

const postInviteToSlack = async applicant => {
    var options = {
        method: "POST",
        uri: inviteUrl,
        formData: { email: applicant.email, token: config.slack_token, set_active: true },
    };

    try {
        var body = await rp(options);
        debug(`Received body from Slack: ${JSON.stringify(body)}...`);
    } catch(error) {
        throw new Error({ error: "invite"} );
    }
    return applicant;
};

const invite = async id => {
    const applicant = await postInviteToSlack(await db.find(id));
    applicant.invited = true;
    return db.replace(id, applicant);
};

/// Replace the message with approved or rejected states.

const replace = async (url, reply) => {
    var options = {
        method: "POST",
        uri: url,
        body: reply,
        json: true,
    };

    var body = await rp(options);
    debug(`Received body from Slack: ${JSON.stringify(body)}`);
    return body;
};

const inviteUrl = `https://${config.slack_url}/api/users.admin.invite`;

module.exports = { send, invite, inviteUrl, replace };