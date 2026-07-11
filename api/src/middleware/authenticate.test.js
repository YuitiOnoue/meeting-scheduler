import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authenticate } from './authenticate.js';

process.env.JWT_SECRET = 'test_secret';

function makeReq(authHeader) {
  return { headers: { authorization: authHeader } };
}

function makeRes() {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

describe('authenticate middleware', () => {
  it('rejects when no Authorization header', () => {
    const req = makeReq(undefined);
    const res = makeRes();
    let nextCalled = false;
    authenticate(req, res, () => {
      nextCalled = true;
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, 'Missing token');
    assert.equal(nextCalled, false);
  });

  it('rejects non-Bearer scheme', () => {
    const req = makeReq('Basic 123');
    const res = makeRes();
    let nextCalled = false;
    authenticate(req, res, () => {
      nextCalled = true;
    });
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('rejects invalid token', () => {
    const req = makeReq('Bearer notvalidtoken');
    const res = makeRes();
    let nextCalled = false;
    authenticate(req, res, () => {
      nextCalled = true;
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.error, 'Invalid or expired token');
    assert.equal(nextCalled, false);
  });

  it('accepts valid token and sets req.user', () => {
    const token = jwt.sign({ id: 'abc', role: 'admin' }, 'test_secret');
    const req = makeReq(`Bearer ${token}`);
    const res = makeRes();
    let nextCalled = false;
    authenticate(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
    assert.equal(req.user.id, 'abc');
    assert.equal(req.user.role, 'admin');
  });
});
