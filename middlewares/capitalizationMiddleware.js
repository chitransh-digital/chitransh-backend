
const captFirstLetter = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].charAt(0).toUpperCase() + req.body[key].slice(1);
            }
        }
    }
    next();
};

module.exports = { captFirstLetter};
