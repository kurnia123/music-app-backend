require('dotenv').config();

const Hapi = require('@hapi/hapi');
const music = require('./api/songs');
const MusicService = require('./services/MusicService');
const MusicsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

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

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message,
            });
            newResponse.code(response.statusCode);
            return newResponse;
        }

        return response.continue || response;
    });

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
