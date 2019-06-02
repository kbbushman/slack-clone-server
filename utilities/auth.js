import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

const createTokens = async (user, secret, secret2) => {
  const createToken = jwt.sign(
    { user: _.pick(user, ['id', 'username']) },
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
  let userId = 0;
  try {
    // Decode the payload ({userId: id})
    const { userId: { id } } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    // Return an empty object if there's a problem decoding the refreshToken
    return {};
  }

  // Return empty object if payload 
  if (!userId) {
    return {};
  }

  // raw: true => returns a raw object instead of a sequelize object
  // A sequelize object creates an instance of the model class with functions for update, delete, associations, etc.
  // This can take a while if you are querying thousands of rows
  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  // Return an empty objec if the userId doesn't exist in DB
  if (!user) {
    return {};
  }

  //  Cache user refresh secret
  const userRefreshSecret = user.password + SECRET2;

  try {
    // Verify refresh token with secret
    jwt.verify(refreshToken, userRefreshSecret);
  } catch (err) {
    // Return empty object if not valid
    return {};
  }

  // Create new token and refresh token
  const [newToken, newRefreshToken] = await createTokens(user, SECRET, userRefreshSecret);
  
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
