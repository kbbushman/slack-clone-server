import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

export const createTokens = async (user, secret, secret2) => {
  const createToken = jwt.sign(
    { user: _.pick(user, ['id']) },
    secret,
    { expiresIn: '1h' },
  );

  const createRefreshToken = jwt.sign(
    { user: _.pick(user, 'id') },
    secret2,
    { expiresIn: '7d' },
  );

  return [createToken, createRefreshToken];
};

export const refreshTokens = async (token, refreshToken, models, SECRET, SECRET2) => {
  let userId = -1;
  try {
    const { userId: { id } } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    return {};
  }

  if (!userId) {
    return {};
  }

  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  if (!user) {
    return {};
  }

  try {
    jwt.verify(refreshToken, user.refreshSecret);
  } catch (err) {
    return {};
  }

  const [newToken, newRefreshToken] = await createTokens(user, SECRET, SECRET2);
  
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  }
}


export const tryLogin = async (email, password, models, SECRET, SECRET2) => {
  if (!email && !password) return { ok: false, errors: [{ path: 'email', message: 'Email is required' }, { path: 'password', message: 'Password is required' }]}
  if (!email) return { ok: false, errors: [{ path: 'email', message: 'Email is required' }]}
  if (!password) return { ok: false, errors: [{ path: 'password', message: 'Password is required' }]}
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // User email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Email or password is incorrect' }],
    }
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // Password does not match
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Email or password is incorrect' }],
    }
  }

  const refreshTokenSecret = user.password + SECRET2;

  const [token, refreshToken] = await createTokens(user, SECRET, refreshTokenSecret);

  return {
    ok: true,
    token,
    refreshToken,
  };
};
