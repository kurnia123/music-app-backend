const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const ClientError = require('../exceptions/ClientError');

class PlaylistSongService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
    }

    async addPlaylistSong(songId, playlistId) {
        const id = `playlistsong-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }
        await this._cacheService.delete(`playlist:${playlistId}`);
    }

    async getAllPlaylistSong(playlistId) {
        try {
            const result = await this._cacheService.get(`playlist:${playlistId}`);
            return JSON.parse(result);
        } catch (error) {
            const query = {
                text: `SELECT playlistsongs.id, musics.title, musics.performer
                FROM playlistsongs 
                LEFT JOIN musics ON musics.id = playlistsongs.song_id
                WHERE playlistsongs.playlist_id = $1`,
                values: [playlistId],
            };

            const result = await this._pool.query(query);
            await this._cacheService.set(`playlist:${playlistId}`, JSON.stringify(result.rows));
            return result.rows;
        }
    }

    async delPlaylistSongById(songId, playlistId) {
        const query = {
            text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND  playlist_id = $2 RETURNING id',
            values: [songId, playlistId],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new ClientError('Lagu gagal dihapus. Id tidak ditemukan');
        }
        await this._cacheService.delete(`playlist:${playlistId}`);
    }
}

module.exports = PlaylistSongService;
