const slack = {
    name: process.env.SLACK_NAME || "Awesome Team",
    url: process.env.SLACK_URL || "awesome-team.slack.com",
    token: process.env.SLACK_TOKEN || "awesome-team-access-token",
    signing_secret: process.env.SLACK_SIGNING_SECRET || "awesome-team-signing-secret",
    verification_token: process.env.SLACK_VERIFICATION_TOKEN || "awesome-team-verification-token",
    hook: process.env.SLACK_HOOK || "https://hooks.slack.com/services/AAAAAAAAA/BBBBBBBBB/aaaaBBBB00001111YYYYzzzz",
    callback_id: process.env.SLACK_CALLBACK_ID || "slack_request",
};

const code_of_conduct_url = process.env.CODE_OF_CONDUCT_URL || "code-of-conduct.awesome-team.com";

module.exports = {
    base_uri: process.env.NODE_ENV === "production" ? process.env.SLACK_REQUEST_BASE_URI : "http://localhost",
    mongo_db: process.env.MONGO_DB || "localhost/slack-request",

    recaptcha_v2: {
        secret: process.env.RECAPTCHA_V2_SECRET || "awesome-team-recaptcha-secret",
        sitekey: process.env.RECAPTCHA_V2_SITEKEY || "awesome-team-recaptcha-sitekey",
    },

    recaptcha_v3: {
        secret: process.env.RECAPTCHA_V3_SECRET || "awesome-team-recaptcha-secret",
        sitekey: process.env.RECAPTCHA_V3_SITEKEY || "awesome-team-recaptcha-sitekey",
    },

    "slack": slack,

    // TODO: generalize

    name: "Deaf Professionals",
    description: `The <strong><a href="https://${slack.url}">Deaf Professionals Slack</a></strong> is a space for deaf and hard&nbsp;of&nbsp;hearing professionals to chat and support each other. We strive to keep it safe, positive, and enriching.`,
    description_metadata: "The Deaf Professionals Slack is a space for deaf and hard of hearing professionals to chat and support each other. We strive to keep it safe, positive, and enriching.",
    "code_of_conduct_url": code_of_conduct_url,
    default_channels: [{ name: "#announcements", description: "occasional announcements", opt_out: false }, { name: "#general-chat", description: "random chat"}],

    requirements: {
        is_deaf_or_hard_of_hearing: {
            text: "I am deaf or hard of hearing!",
            error: "You must be deaf or hard of hearing to join this Slack!",
        },
        has_agreed_to_code_of_conduct: {
            text: `I agree to the <a href="${code_of_conduct_url}">Code&nbsp;of&nbsp;Conduct</a>!`,
            error: "You must agree to the Code of Conduct!",
        },
    },
};
