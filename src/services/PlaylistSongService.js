const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const ClientError = require('../exceptions/ClientError');

class PlaylistSongService {
    constructor() {
        this._pool = new Pool();
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
    }

    async getAllPlaylistSong(playlistId) {
        const query = {
            text: `SELECT playlistsongs.id, musics.title, musics.performer
            FROM playlistsongs 
            LEFT JOIN musics ON musics.id = playlistsongs.song_id
            WHERE playlistsongs.playlist_id = $1`,
            values: [playlistId],
        };

        const result = await this._pool.query(query);
        return result.rows;
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
    }
}

module.exports = PlaylistSongService;
