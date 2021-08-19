const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapDBToModel } = require('../utils/models');

class MusicService {
    constructor() {
        this._pool = new Pool();
    }

    async addMusic(payload) {
        const id = 'song-'.concat(nanoid(16));
        const insertedAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO musics VALUES($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id',
            values: [id, ...Object.values(payload), insertedAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Music gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getMusics() {
        const result = await this._pool.query('SELECT id, title, performer FROM musics');
        return result.rows;
    }

    async getMusicById(id) {
        const query = {
            text: 'SELECT * FROM musics WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Music tidak ditemukan');
        }

        return result.rows.map(mapDBToModel)[0];
    }

    async editMusicById(id, { title, year, performer, genre, duration }) {
        const updatedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE musics SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
            values: [title, year, performer, genre, duration, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui music. Id tidak ditemukan');
        }
    }

    async deleteMusicById(id) {
        const query = {
            text: 'DELETE FROM musics WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Music gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = MusicService;
