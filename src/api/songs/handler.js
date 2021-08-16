const autoBind = require('auto-bind');
const ClientError = require('../../exceptions/ClientError');

class MusicHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postMusicHandler(request, h) {
        try {
            this._validator.validateMusicPayload(request.payload);
            const { title, year, performer, genre, duration } = request.payload;

            const songId = await this._service.addMusic({
                title,
                year,
                performer,
                genre,
                duration,
            });

            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan',
                data: {
                    songId,
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

    async getMusicsHandler() {
        const songs = await this._service.getMusics();
        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }

    async getMusicByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const song = await this._service.getMusicById(id);
            return {
                status: 'success',
                data: {
                    song,
                },
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

    async putMusicByIdHandler(request, h) {
        try {
            this._validator.validateMusicPayload(request.payload);
            const { title, year, performer, genre, duration } = request.payload;
            const { id } = request.params;

            await this._service.editMusicById(id, { title, year, performer, genre, duration });

            return {
                status: 'success',
                message: 'Lagu berhasil diperbarui',
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

    async deleteMusicByIdHandler(request, h) {
        try {
            const { id } = request.params;
            await this._service.deleteMusicById(id);

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus',
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

module.exports = MusicHandler;
