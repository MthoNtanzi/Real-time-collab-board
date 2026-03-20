function errorHandler(err, req, res, next) {
    console.error(err.stack);

    if (err.code === "22P02") {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const status = err.status || 500;
    const message = err.message || "Internal server error";

    res.status(status).json({ error: message });
}

module.exports = errorHandler;