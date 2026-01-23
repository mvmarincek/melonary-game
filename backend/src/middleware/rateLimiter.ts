import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many attempts, please try again later' },
  validate: { xForwardedForHeader: false }
});

export const gameLimiter = rateLimit({
  windowMs: 1000,
  max: 100,
  message: { error: 'Too many requests' },
  validate: { xForwardedForHeader: false }
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { error: 'Rate limit exceeded' },
  validate: { xForwardedForHeader: false }
});
