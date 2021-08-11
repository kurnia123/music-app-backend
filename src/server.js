require('dotenv').config();

const Hapi = require('@hapi/hapi');
const music = require('./api/songs');
const MusicService = require('./services/MusicService');
const MusicsValidator = require('./validator/songs');

const init = async () => {
    const musicService = new MusicService();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: music,
        options: {
            service: musicService,
            validator: MusicsValidator,
        },
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
