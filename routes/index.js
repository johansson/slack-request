const express = require("express");
const router = express.Router();
const slack = require("../lib/manager");
const validate = require("../middlewares/signup");
const debug = require("debug")("slack-request:routes:index");
const config = require("../config");

const number_to_string = number => {
    switch (number) {
    case 1: return "one";
    case 2: return "two";
    case 3: return "three";
    default: return "many";
    }
};

const ViewModel = nonce => {
    return {
        page: "index",
        path: "/",
        lang: "en",
        nonce: nonce,
        name: config.name,
        title: `Welcome - ${config.name} Slack`,
        base_uri: config.base_uri,
        description: config.description,
        description_metadata: config.description_metadata,
        code_of_conduct_url: config.code_of_conduct_url,
        whos_invited: config.whos_invited,
        default_channels: config.default_channels,
        non_optout_channel: config.default_channels.find(channel => !channel.opt_out),
        number_of_channels: number_to_string(config.default_channels.length),
        requirements: config.requirements,
        recaptcha_sitekey: config.recaptcha_v3.sitekey,
        context: {},
    };
};

router.get("/", (_req, res) => {
    var viewModel = ViewModel(res.locals.cspToken);
    res.render("index", viewModel);
});

const parse = req => {
    return {
        "name": req.body["name"],
        "email": req.body["email"],
        "education": req.body["education"],
        "work": req.body["work"],
        "about": req.body["about"],
        "has_fulfilled_requirements": req.body["is_deaf_or_hard_of_hearing"] == "on" && req.body["has_agreed_to_code_of_conduct"] == "on",
        "invited": false,
    };
};

// eslint-disable-next-line no-unused-vars
router.post("/", express.urlencoded({ extended: false }), validate, async (req, res, _next) => {
    if (process.env.NODE_ENV !== "production") {
        debug(`POST: applicant: ${JSON.stringify(parse(req), undefined, 2)}`);
    }

    var viewModel = ViewModel(res.locals.cspToken);

    if (req.recaptcha && req.recaptcha.error) {
        viewModel.error = {
            error: req.recaptcha.error,
            message: "Something went wrong, please try again. If this persists, please try from another computer.",
        };

        viewModel.context = parse(req);

        return res.render("index", viewModel);
    }

    try {
        var applicant = await slack.send(parse(req));

        if (process.env.NODE_ENV !== "production") {
            res.json(applicant).send();
        } else {
            res.redirect(303, "/thankyou");
        }
    } catch (error) {
        debug(`error: ${JSON.stringify(error, undefined, 2)}`);

        viewModel.error = {
            error: error.error,
            message: "Something went wrong, please check the form below and submit again.",
        };

        viewModel.context = error.context;

        res.render("index", viewModel);
    }
});

// eslint-disable-next-line no-unused-vars
router.get("/signup", async (_req, res, _next) => {
    debug("visitor had the old /signup url, redirecting them...");
    res.redirect(301, "/");
});

module.exports = router;
