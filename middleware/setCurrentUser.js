import jwt from 'jsonwebtoken';
import models from '../models';
import keys from '../config/keys';
import { refreshTokens } from '../utilities/auth';

export default async (req, res, next) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      const { user } = jwt.verify(token, keys.SECRET);
      req.currentUser = user;
    } catch (err) {
      const refreshToken = req.headers['x-refreshToken'];
      const newTokens = await refreshTokens(token, refreshToken, models, keys.SECRET, keys.SECRET2);
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token', 'x-refreshToken');
        res.set('x-token', newTokens.token);
        res.set('x-refreshToken', newTokens.refreshToken);
      }
      req.currentUser = newTokens.user;
    }
  }
  next();
};
