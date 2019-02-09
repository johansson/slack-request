var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var csp = require("express-csp");
const debug = require("debug")("slack-request:app");

var config = require("./config");

const indexRoute = require("./routes/index");
const recaptchaRoute = require("./routes/recaptcha");
const thankYouRoute = require("./routes/thankyou");

const slack = require("@slack/interactive-messages").createMessageAdapter(config.slack.signing_secret);
const slackRequest = require("./routes/slack");

slack.action(/slackrequest_\d+/, slackRequest.processPayload);

var app = express();

csp.extend(app, {
    policy: {
        useScriptNonce: true,
        directives: {
            "default-src": ["none"],
            "object-src": ["none"],
            "frame-src": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
            "frame-ancestors": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
            "img-src": ["self", "data:", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
            "script-src": [config.base_uri],
            "style-src": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
            "form-src": ["self"],
            "base-uri": ["none"],
        },
        reportPolicy: {
            useScriptNonce: true,
            directives: {
                "default-src": ["none"],
                "object-src": ["none"],
                "frame-src": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "frame-ancestors": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "img-src": ["self", "data:", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "script-src": [config.base_uri],
                "style-src": ["self", "https://www.google.com/recaptcha/", "https://www.gstatic.com/recaptcha/"],
                "form-src": ["self"],
                "base-uri": ["none"],
            },
        },
    }
});

app.locals.pretty = app.get("env") !== "production";
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRoute);
app.use("/js", recaptchaRoute);
app.use("/thankyou", thankYouRoute);

app.use("/slack", slack.expressMiddleware());

app.use(function (_req, _res, next) {
    next(createError(404));
});

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, _next) {
    debug(`Unhandled page: ${req.path}, error: ${JSON.stringify(err)}`);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);

    const viewModel = {
        page: "error",
        lang: "en",
        name: config.name,
        title: `${err.message} - ${config.name} Slack`,
        description: config.description,
        code_of_conduct_url: config.code_of_conduct_url,
    };

    res.render("error", viewModel);
});

module.exports = app;
