const debug = require("debug")("slack-request:lib:background");

const background = async (arg, task, fn) => {
    try {
        debug(`Starting background worker: ${task}...`);
        const result = await fn(arg);
        debug(`Finished background worker: ${task} with result ${JSON.stringify(result)})`);
        return result;
    } catch (error) {
        debug(`Something went wrong with background worker ${task}: ${JSON.stringify(error)}`);
    }
};

module.exports = background;