const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class PlaylistService {
    constructor(collaborationService, cacheService) {
        this._pool = new Pool();
        this._collaborationService = collaborationService;
        this._cacheService = cacheService;
    }

    async addPlaylist(name, userId) {
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlist VALUES($1, $2, $3) RETURNING id',
            values: [id, name, userId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Kolaborasi gagal ditambahkan');
        }

        await this._cacheService.delete(`playlist:${id}`);
        return result.rows[0].id;
    }

    async getPlaylist(ownerId) {
        const query = {
            text: `SELECT playlist.id, playlist.name, users.username
            FROM playlist
            LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id
            LEFT JOIN users ON playlist.owner = users.id
            WHERE playlist.owner = $1 OR collaborations.user_id = $1`,
            values: [ownerId],
        };

        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlist WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
        }
        await this._cacheService.delete(`playlist:${id}`);
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT owner FROM playlist WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('playlist tidak ditemukan');
        }
        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistService;
