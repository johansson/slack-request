const debug = require("debug")("slack-request:lib:db");
const config = require("../config");

const insert = applicant => {
    debug(`Inserting ${applicant.name} into db...`);
    return new Promise((resolve, reject) => {
        require("monk")(config.mongo_db).then(async db => {
            const signups = db.get("signups");

            try {
                var inserted = await signups.insert(applicant);
                debug(`Inserted ${JSON.stringify(inserted)}...`);
                resolve(inserted);
            } catch (error) {
                reject(error);
            } finally {
                db.close();
            }
        }).catch(() => {
            reject({ error: "db_error", context: applicant });
        });
    });
};

const find = id => {
    return new Promise((resolve, reject) => {
        require("monk")(config.mongo_db).then(async db => {
            const signups = db.get("signups");

            try {
                const applicant = await signups.findOne({ _id: id });
                resolve(applicant);
            } catch (error) {
                reject(`applicant with id of ${id} not found (error: ${error})`);
            } finally {
                debug("closing connection");
                db.close();
            }
        }).catch(error => {
            reject(error);
        });
    });
};

const replace = (id, applicant) => {
    return new Promise((resolve, reject) => {
        require("monk")(config.mongo_db).then(async db => {
            const signups = db.get("signups");

            try {
                const replaced = await signups.update({ _id: id }, applicant);

                if (replaced.n === 1 && replaced.nModified === 1 && replaced.ok === 1) {
                    resolve(applicant);
                } else {
                    reject({ error: "db_error", context: applicant });
                }
            } catch (error) {
                reject({ error: "db_error", context: applicant });
            } finally {
                db.close();
            }
        }).catch(error => {
            reject(error);
        });
    });
};

module.exports = { insert, find, replace };