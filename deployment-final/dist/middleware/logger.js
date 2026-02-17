"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        console.log('Headers:', req.headers);
        console.log('Query:', req.query);
        console.log('Body:', req.body);
    });
    next();
};
exports.requestLogger = requestLogger;
