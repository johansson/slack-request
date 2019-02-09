const education = {
    none: "None",
    secondary: "High school/GED/Secondary",
    trade: "Trade",
    as: "Associate's",
    bs: "Bachelor's",
    ms: "Master's",
    phd: "Doctoral",
    pro: "Professional (law, medical, etc.)",
};

const fields = applicant => {
    return {
        "fields": [
            {
                "title": "Name",
                "value": applicant.name
            },
            {
                "title": "E-mail",
                "value": applicant.email,
            },
            {
                "title": "Education",
                "value": education[applicant.education],
            },
            {
                "title": "Work experience",
                "value": applicant.work,
            },
            {
                "title": "About",
                "value": applicant.about,
            }
        ]
    };
};

const buttons = applicant => {
    return {
        "callback_id": `slackrequest_${applicant._id}`,
        "attachment_type": "default",
        "fallback": `Open a capable client to approve or reject ${applicant.name}'s request to join.`,
        "color": "#7755ee",
        "actions": [
            { "name": "approval", "text": "Approve", "type": "button", "value": "approved", "style": "primary" },
            { "name": "approval", "text": "Disapprove", "type": "button", "value": "rejected", "style": "danger" },
        ]
    };
};

const attachments = applicant => {
    return [fields(applicant), buttons(applicant)];
};

const make = applicant => {
    return {
        "text": `*${applicant.name}* wants to join this Slack!`,
        "attachments": attachments(applicant),
    };
};

module.exports = { make };