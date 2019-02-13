const debug = require("debug")("slack-request:lib:test");

const longWork = (shouldResolve, error) => {
    return arg => {
        debug(`shouldResolve: ${shouldResolve}, arg: ${JSON.stringify(arg)}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (shouldResolve) {
                    resolve(arg);
                } else {
                    reject(error || { error: "intentional fail", context: arg });
                }
            }, 10000);
        });
    };
};


const databaseFailure = applicant => {
    // eslint-disable-next-line no-unused-vars
    return new Promise((_resolve, reject) => {
        setTimeout(() => reject({ error: "db_error", context: applicant }), 1000);
    });
};

module.exports = { longWork, databaseFailure };