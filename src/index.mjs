import socketServer from './sockets/socket-server.mjs'
import { promisify } from 'util'
import redis from 'redis'

//redis setup
let redisClient = redis.createClient()
redisClient.get = promisify(redisClient.get)
redisClient.set = promisify(redisClient.set)

//socket setup
socketServer.createServer(redisClient)
socketServer.use()
socketServer.listen()
