const autoBind = require('auto-bind');

class MusicHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postMusicHandler(request, h) {
        this._validator.validateMusicPayload(request.payload);

        const songId = await this._service.addMusic(request.payload);

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan',
            data: {
                songId,
            },
        });
        response.code(201);
        return response;
    }

    async getMusicsHandler() {
        const songs = await this._service.getMusics();
        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }

    async getMusicByIdHandler(request) {
        const { id } = request.params;
        const song = await this._service.getMusicById(id);
        return {
            status: 'success',
            data: {
                song,
            },
        };
    }

    async putMusicByIdHandler(request) {
        this._validator.validateMusicPayload(request.payload);
        const { title, year, performer, genre, duration } = request.payload;
        const { id } = request.params;

        await this._service.editMusicById(id, { title, year, performer, genre, duration });

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        };
    }

    async deleteMusicByIdHandler(request) {
        const { id } = request.params;
        await this._service.deleteMusicById(id);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }
}

module.exports = MusicHandler;
