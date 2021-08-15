const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistHandler,
        options: {
            auth: 'musicsapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getAllPlaylistHandler,
        options: {
            auth: 'musicsapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistsId}',
        handler: handler.deletePlaylistByIdHandler,
        options: {
            auth: 'musicsapp_jwt',
        },
    },
];

module.exports = routes;
