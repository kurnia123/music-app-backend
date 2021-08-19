require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const music = require('./api/songs');
const MusicService = require('./services/MusicService');
const MusicsValidator = require('./validator/songs');

// users
const users = require('./api/users');
const UsersService = require('./services/UserService');
const UsersValidator = require('./validator/users');

const authentications = require('./api/authentication');
const AuthenticationsService = require('./services/AuthenticationService');
const AuthenticationsValidator = require('./validator/authentication');

const playlist = require('./api/playlist');
const PlaylistService = require('./services/PlaylistService');
const PlaylistsValidator = require('./validator/playlist');

const playlistsongs = require('./api/playlistsongs');
const PlaylistSongService = require('./services/PlaylistSongService');
const PlaylistsSongValidator = require('./validator/playlistsongs');

const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationService');
const CollaborationsValidator = require('./validator/collaborations');

const _exports = require('./api/exports');
const ProducerService = require('./services/export/ExportPlaylistService');
const ExportsValidator = require('./validator/exports');

const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/upload');

const CacheService = require('./services/cache/CacheService');

const init = async () => {
    const cacheService = new CacheService();
    const collaborationsService = new CollaborationsService(cacheService);
    const playlistService = new PlaylistService(collaborationsService, cacheService);
    const musicService = new MusicService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService(cacheService);
    const playlistSongService = new PlaylistSongService(cacheService);
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    server.auth.strategy('musicsapp_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: music,
            options: {
                service: musicService,
                validator: MusicsValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlist,
            options: {
                playlistService,
                validator: PlaylistsValidator,
            },
        },
        {
            plugin: playlistsongs,
            options: {
                playlistSongService,
                playlistService,
                validator: PlaylistsSongValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                playlistService,
                service: ProducerService,
                validator: ExportsValidator,
            },
        },
        {
            plugin: uploads,
            options: {
                service: storageService,
                validator: UploadsValidator,
            },
        },
    ]);

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
