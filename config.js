module.exports = {
    slack_name: process.env.SLACK_NAME || 'Awesome Team',
    slack_url: process.env.SLACK_URL || 'awesome-team.slack.com',
    slack_token: process.env.SLACK_TOKEN || 'awesome-team-access-token',
    mongo_db: process.env.MONGO_DB || 'localhost/slack-request',
    signup_description: process.env.SIGNUP_DESC || 'You can sign up for Awesome Team by filling out the form:',
    conditional: process.env.CONDITIONAL || 'Do you identify with this group?',
    conditional_error: process.env.CONDITIONAL_ERROR || 'You must identify with this group!',
    code_of_conduct: process.env.CODE_OF_CONDUCT || 'http://awesome-team.com/codeofconduct',
    admins: { 'foo@bar.com': { password: 'p@$$w0rd!' } }
};
