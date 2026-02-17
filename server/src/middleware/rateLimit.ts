import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message: string;
}

type Entry = {
  count: number;
  resetAt: number;
};

export const createRateLimiter = (options: RateLimitOptions) => {
  const store = new Map<string, Entry>();

  return (req: Request, res: Response, next: NextFunction) => {
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
