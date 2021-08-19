class ExportsHandler {
    constructor(playlistService, service, validator) {
        this._service = service;
        this._validator = validator;
        this._playlistService = playlistService;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        const { id: credentialId } = request.auth.credentials;
        const { playlistId } = request.params;

        this._validator.validateExportPlaylistPayload(request.payload);
        await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

        const message = {
            userId: credentialId,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage('export:playlist', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}

module.exports = ExportsHandler;
