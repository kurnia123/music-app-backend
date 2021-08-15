exports.up = (pgm) => {
    pgm.createTable('playlistsongs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        song_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.playlist_id_playlist.id', 'FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE ON UPDATE CASCADE');
    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.song_id_musics.id', 'FOREIGN KEY(song_id) REFERENCES musics(id) ON DELETE CASCADE ON UPDATE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('playlistsongs');
};
