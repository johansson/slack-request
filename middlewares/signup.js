const express_recaptcha = require("express-recaptcha").Recaptcha;
const { check, validationResult } = require("express-validator/check");
const debug = require("debug")("slack-request:middlewares:signup");
const config = require("../config");

var validators = [
    check("name")
        .not().isEmpty()
        .trim()
        .escape()
        .withMessage("We need your name!"),

    check("email")
        .isEmail()
        .normalizeEmail({
            all_lowercase: true,
            gmail_lowercase: true,
            gmail_remove_dots: false,
            gmail_remove_subaddress: false,
            gmail_convert_googlemaildotcom: false,
            outlookdotcom_lowercase: true,
            outlookdotcom_remove_subaddress: false,
            yahoo_lowercase: true,
            yahoo_remove_subaddress: false,
            icloud_lowercase: true,
            icloud_remove_subaddress: false,
        })
        .withMessage("Bad e-mail format"),

    check("education")
        .not().isEmpty()
        .withMessage("Please select level of education")
        .escape()
        .custom(education => {
            const isValid = ["none", "secondary", "trade", "as", "bs", "ms", "phd", "pro"].includes(education);
            if (!isValid) {
                return Promise.reject(`Unknown education value: ${education}`);
            }

            return Promise.resolve(education);
        }),

    check("work")
        .trim()
        .not().isEmpty()
        .withMessage("Tell us about your work experience, please."),

    check("about")
        .trim()
        .not().isEmpty()
        .withMessage("You told us nothing about yourself!")
        .escape(),

    check("is_deaf_or_hard_of_hearing")
        .trim()
        .not().isEmpty()
        .withMessage(config.requirements["is_deaf_or_hard_of_hearing"].error),

    check("has_agreed_to_code_of_conduct")
        .trim()
        .not().isEmpty()
        .withMessage(config.requirements["has_agreed_to_code_of_conduct"].error),
];

var recaptcha = new express_recaptcha(config.recaptcha_v3.sitekey, config.recaptcha_v3.secret);

const skipValidationMessage = (_req, _res, next) => { debug("skipping recaptcha..."); next(); };

const debugValidation = (req, _res, next) => {
    if (process.env.NODE_ENV !== "production" && req.validationErrors) {
        debug(`validation errors: ${JSON.stringify(req.validationErrors, null, 2)}`);
    }

    next();
};

const debugRecaptcha = (req, _res, next) => {
    if (typeof (req.recaptcha) !== "undefined" && req.recaptcha.error) {
        debug(`recaptcha error: ${JSON.stringify(req.recaptcha.error, undefined, 2)}`);
    }

    next();
};

const _validate = (req, _res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.validationErrors = errors.array();
    }

    next();
};

const validate = [
    validators,
    _validate,
    debugValidation,
    process.env.NODE_ENV === "production" ? recaptcha.middleware.verify : skipValidationMessage,
    debugRecaptcha,
];

module.exports = validate;
