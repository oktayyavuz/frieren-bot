const crypto = require('crypto');

function b64url(buf) {
    return Buffer.from(buf).toString('base64url');
}

function sign(payload, secret) {
    const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body   = b64url(JSON.stringify(payload));
    const sig    = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${sig}`;
}

function verify(token, secret) {
    const parts = (token || '').split('.');
    if (parts.length !== 3) throw new Error('Geçersiz token formatı');

    const [header, body, sig] = parts;
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        throw new Error('İmza geçersiz');
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));

    if (payload.exp && Date.now() / 1000 > payload.exp) {
        throw new Error('Token süresi dolmuş');
    }

    return payload;
}

/** Dashboard → Bot istekleri için 30 saniyelik token üretir */
function createApiToken(secret) {
    const now = Math.floor(Date.now() / 1000);
    return sign({ iss: 'frieren-dashboard', iat: now, exp: now + 30 }, secret);
}

module.exports = { sign, verify, createApiToken };
