const autoBind = require('auto-bind');

class PlaylistSongHandler {
    constructor(playlistSongService, playlistService, validator) {
        this._playlistService = playlistService;
        this._playlistSongService = playlistSongService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistSongHandler(request, h) {
        this._validator.validatePlaylistSongPayload(request.payload);
        const { playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongService.addPlaylistSong(songId, playlistId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
        });
        response.code(201);
        return response;
    }

    async getAllPlaylistSongHandler(request, h) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        const songs = await this._playlistSongService.getAllPlaylistSong(playlistId);

        const response = h.response({
            status: 'success',
            data: {
                songs,
            },
        });
        response.code(200);
        return response;
    }

    async deletePlaylistSongHandler(request, h) {
        const { playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;
        const { songId } = request.payload;

        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
        await this._playlistSongService.delPlaylistSongById(songId, playlistId);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        });
        response.code(200);
        return response;
    }
}
module.exports = PlaylistSongHandler;
