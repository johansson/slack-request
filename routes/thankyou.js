const express = require("express");
const router = express.Router();
const debug = require("debug")("slack-request:routes:thankyou");
const config = require("../config");

router.get("/", (req, res) => {
    debug("Rendering thank you page");

    const viewModel = {
        page: "thankyou",
        path: "/thankyou",
        lang: "en",
        name: config.name,
        title: `Thank you for signing up! - ${config.name} Slack`,
        base_uri: config.base_uri,
        description_metadata: config.description_metadata,
        code_of_conduct_url: config.code_of_conduct_url,
        slack_url: config.slack.url
    };

    res.render("thankyou", viewModel);
});

module.exports = router;