const captFirstLetter = (req, res, next) => {
    const capitalize = (value) => {
        if (typeof value === 'string') {
            return value.charAt(0).toUpperCase() + value.slice(1);
        } else if (Array.isArray(value)) {
            return value.map(capitalize);
        } else if (value && typeof value === 'object') {
            Object.keys(value).forEach(key => {
                value[key] = capitalize(value[key]);
            });
        }
        return value;
    };

    if (req.body) {
        req.body = capitalize(req.body);
    }

    next();
};

module.exports = { captFirstLetter };