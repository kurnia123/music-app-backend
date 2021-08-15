const ClientError = require('../../exceptions/ClientError');

class PlaylistHandler {
    constructor(service, validator) {
        this._playlistService = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getAllPlaylistHandler = this.getAllPlaylistHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
        try {
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
        } catch (error) {
            if (error instanceof ClientError) {
                return error;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
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

    async deletePlaylistByIdHandler(request, h) {
        try {
            const { playlistsId } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._playlistService.verifyPlaylistOwner(playlistsId, credentialId);
            await this._playlistService.deletePlaylistById(playlistsId);

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
        } catch (error) {
            if (error instanceof ClientError) {
                return error;
            }

            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = PlaylistHandler;
