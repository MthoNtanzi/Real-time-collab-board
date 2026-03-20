function validateId(req, res, next) {
    const id = req.params.id || req.params.cardId || req.params.boardId;

    if (id) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
    }
    next();
}

module.exports = validateId;