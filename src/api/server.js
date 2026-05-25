const http = require('http');
const { parse } = require('url');
const logger = require('../utils/logger');
const { verify } = require('../utils/jwt');

let _client = null;
let _server = null;

function respond(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function start(client) {
    _client = client;
    const port = parseInt(process.env.BOT_API_PORT || '4917', 10);
    const jwtSecret = process.env.JWT_SECRET || '';

    _server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            return res.end();
        }

        if (jwtSecret) {
            const authHeader = req.headers['authorization'] || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
            try {
                verify(token, jwtSecret);
            } catch (e) {
                return respond(res, 401, { error: `Unauthorized: ${e.message}` });
            }
        }

        const { pathname } = parse(req.url || '/');
        const parts = (pathname || '/').split('/').filter(Boolean);

        
        if (parts[0] === 'api' && parts[1] === 'health') {
            return respond(res, 200, {
                status: 'ok',
                guilds: _client.guilds.cache.size,
                users: _client.users.cache.size,
                ping: _client.ws.ping,
            });
        }

        
        if (parts[0] === 'api' && parts[1] === 'guilds' && !parts[2]) {
            const guilds = [..._client.guilds.cache.values()].map(g => ({
                id: g.id,
                name: g.name,
                icon: g.icon,
                memberCount: g.memberCount,
                ownerId: g.ownerId,
                permissions: '8',
            }));
            return respond(res, 200, guilds);
        }

        
        if (parts[0] === 'api' && parts[1] === 'guilds' && parts[2] && parts[3] === 'channels') {
            const guild = _client.guilds.cache.get(parts[2]);
            if (!guild) return respond(res, 404, { error: 'Guild not found' });

            const channels = [...guild.channels.cache.values()]
                .filter(c => [0, 2, 4, 5, 13, 15].includes(c.type))
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    parentId: c.parentId || null,
                    position: c.position || 0,
                }))
                .sort((a, b) => a.position - b.position);
            return respond(res, 200, channels);
        }

        
        if (parts[0] === 'api' && parts[1] === 'guilds' && parts[2] && parts[3] === 'roles') {
            const guild = _client.guilds.cache.get(parts[2]);
            if (!guild) return respond(res, 404, { error: 'Guild not found' });

            const roles = [...guild.roles.cache.values()]
                .filter(r => r.id !== guild.id)
                .map(r => ({
                    id: r.id,
                    name: r.name,
                    color: r.color,
                    managed: r.managed,
                    position: r.position,
                }))
                .sort((a, b) => b.position - a.position);
            return respond(res, 200, roles);
        }

        return respond(res, 404, { error: 'Not found' });
    });

    _server.listen(port, '127.0.0.1', () => {
        logger.info(`✅ Bot API aktif: http://127.0.0.1:${port}`, 'API');
    });

    _server.on('error', (err) => {
        logger.error(`Bot API hatası: ${err.message}`, 'API');
    });

    return _server;
}

function stop() {
    if (_server) _server.close();
}

module.exports = { start, stop };
