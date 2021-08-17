const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(service, validator) {
        this._playlistService = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { name } = request.payload;
        const playlistId = await this._playlistService.addPlaylist(name, credentialId);

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getAllPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;
        const playlists = await this._playlistService.getPlaylist(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { playlistsId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistService.verifyPlaylistOwner(playlistsId, credentialId);
        await this._playlistService.deletePlaylistById(playlistsId);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }
}

module.exports = PlaylistHandler;
