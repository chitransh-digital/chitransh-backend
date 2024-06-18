const captFirstLetter = (req, res, next) => {
    const skipFields = ['images', 'logo', 'profilePic','attachments', 'link', 'coupon'];

    const capitalize = (value) => {
        if (typeof value === 'string') {
            return value.charAt(0).toUpperCase() + value.slice(1);
        } else if (Array.isArray(value)) {
            return value.map(capitalize);
        } else if (value && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                if (!skipFields.includes(key)) {
                    value[key] = capitalize(value[key]);
                }
            });
        }
        return value;
    };

    if (req.body) {
        req.body = capitalize(req.body);
        if (req.body.memberData && typeof req.body.memberData === 'string') {
            try {
                const parsedMemberData = JSON.parse(req.body.memberData);
                const capitalizedMemberData = capitalize(parsedMemberData);
                req.body.memberData = JSON.stringify(capitalizedMemberData);
            } catch (error) {
                console.error('Error parsing memberData:', error.message);
            }
        }
    }

    next();
};

module.exports = { captFirstLetter };