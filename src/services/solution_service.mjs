import {
    NEW_SOLUTION,
    RUN_SOLUTION,
    ALL_SOLUTION,
    REMOVE_ALL_SOLUTION,
} from '../sockets/EventType.mjs'
import { EvaluateSourceCode } from '../sandboxing/EvaluateSourceCode.mjs'
import redis from 'redis'
const SolutionService = function (redisClient, socket, chatApp) {
    this.redisClient = redisClient
    this.socket = socket
    this.chatApp = chatApp
}

SolutionService.prototype.listen = function () {

    this.onAddSolution()
    this.getAllSolution()
    this.onRunSolution()
    this.onRemoveAllSolution()

}


SolutionService.prototype.onAddSolution = function () {
    this.socket.on(NEW_SOLUTION, ({ room, payload }, ackCallback) => {
        payload.timeStamp = new Date()
        this.redisClient.rpush([`${room}:solutions`, JSON.stringify(payload)], redis.print)
        ackCallback()
        this.broadcastToRoom(NEW_SOLUTION, room, payload)
    })
}

SolutionService.prototype.getAllSolution = function () {
    this.socket.on(ALL_SOLUTION, (room, callback) => {
        this.redisClient.lrange(`${room}:solutions`, 0, -1, (error, solutions = []) => {
            if (error) {
                console.log("GET ALL SOLUTION ERROR : ", error);
                callback([])
            }
            let parsedSolutions = solutions.map(solution => JSON.parse(solution))
            callback(parsedSolutions.reverse())
        })
    })
}

SolutionService.prototype.onRunSolution = function () {
    this.socket.on(RUN_SOLUTION, (payload, callback) => {
        new EvaluateSourceCode(payload).runCode(callback)
    })
}

SolutionService.prototype.onRemoveAllSolution = function () {
    this.socket.on(REMOVE_ALL_SOLUTION, (room, callback) => {
        this.redisClient.del(`${room}:solutions`, (err, reply) => {
            if (err) {
                console.log("REMOVE ALL SOLUTION ERROR : ", err.message);
                callback(err)
            }
            callback()
            this.broadcastToRoom(REMOVE_ALL_SOLUTION, room)
        })
    })
}

SolutionService.prototype.broadcastToRoom = function (event, room, message) {
    this.chatApp.in(room).emit(event, message)
}

export default SolutionService