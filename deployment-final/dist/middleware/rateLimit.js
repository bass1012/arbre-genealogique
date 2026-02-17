"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimiter = void 0;
const createRateLimiter = (options) => {
    const store = new Map();
    return (req, res, next) => {
        const now = Date.now();
        const key = `${req.ip}:${req.path}`;
        const current = store.get(key);
        if (!current || now > current.resetAt) {
            store.set(key, { count: 1, resetAt: now + options.windowMs });
            return next();
        }
        if (current.count >= options.max) {
            const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
            return res.status(429).json({
                success: false,
                message: options.message,
                retryAfterSeconds
            });
        }
        current.count += 1;
        store.set(key, current);
        next();
    };
};
exports.createRateLimiter = createRateLimiter;
