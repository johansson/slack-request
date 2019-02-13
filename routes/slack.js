const debug = require("debug")("slack-request:slack");
const manager = require("../lib/manager");

const processingText = (applicant, isApproved) => isApproved ? "⏳ Processing approval...": `*${applicant.name}* was rejected. ❌`;
const processedText = applicant => `*${applicant.name}* was approved! ✅`;

const reconstructButtons = async (response_url, reply, actions) => {
    delete reply.attachments[1].text;
    reply.attachments[1].actions = actions;

    try {
        await manager.replace(response_url, reply);
    } catch(error) {
        debug("i give up... something wonky went on with slack. you're forever going to see the ");
    }
};

const invite = async payload => {
    const id = payload.callback_id.split("_")[1];

    var reply = payload.original_message;
    var actions = reply.attachments[1].actions;
    delete reply.attachments[1].actions;

    try {
        const applicant = await manager.invite(id);
        debug(`woo hoo we have successfully invited ${JSON.stringify(applicant)}`);
        reply.attachments[1].text = processedText(applicant);

        await manager.replace(payload.response_url, reply);
    } catch (error) {
        if (error.options.uri === manager.inviteUrl) {
            debug("applicant was NOT successfully invited, reconstructing buttons. but if that fails, sorry, invite manually!");
            reconstructButtons(payload.response_url, reply, actions);
        } else if (error.error === "db_error") {
            debug(`applicant was successfully invited, we just had an oops with db. check id: ${id}`);
        } else if (error.options.uri === payload.response_url) {
            debug("applicant was successfully invited, we just had an oops with slack interactive msg, sorry.");
        }
        debug(`error: ${error}`);
    }
};

const processPayload = payload => {
    const isApproved = payload.actions[0].value === "approved";
    const id = payload.callback_id.split("_")[1];

    debug(`admin sent in ${ isApproved ? "approval" : "rejection" } for ${id}`);

    invite(payload);

    var reply = payload.original_message;
    delete reply.attachments[1].actions;
    reply.attachments[1].text = processingText(isApproved);
    return reply;
};

module.exports = { processPayload };