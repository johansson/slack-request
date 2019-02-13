const express = require("express");
const router = express.Router();
const config = require("../config");

router.get("/recaptcha.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript;charset=utf-8");
    res.write(`var loadRecaptcha = () => {
    grecaptcha.ready(() => {
        grecaptcha.execute("${ config.recaptcha_v3.sitekey }", { action: "signup" } ).then(function(token) {
            var recaptchaResponse = document.getElementById("recaptchaResponse");
            recaptchaResponse.value = token;
        });
    });
};
`);
    res.end();
});

module.exports = router;