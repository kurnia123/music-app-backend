const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlist',
    version: '1.0.0',
    register: async (server, { playlistService, validator }) => {
        const playlistHandler = new PlaylistHandler(
            playlistService, validator,
        );
        server.route(routes(playlistHandler));
    },
};
