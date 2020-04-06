import io from 'socket.io'
import { promisify, log } from 'util'
import redis from 'redis'
import {
    ALL_ROOM,
    ALL_CLIENT_IN_ROOM,
    JOIN_ROOM,
    NEW_JOINING_ROOM,
    LEAVE_ROOM,
    LEFT_ROOM,
    DISCONNECTING,
    NEW_MESSAGE,
    ALL_MESSAGE,
    NEW_PROBLEM,
    ALL_PROBLEM,
    NEW_SOLUTION,
    RUN_SOLUTION,
    ALL_SOLUTION,
    MESSAGE_TYPING,
    CONNECT
} from './EventType.mjs'
import { EvaluateSourceCode } from '../sandboxing/EvaluateSourceCode.mjs'

// chat app

const SocketServer = function () { }

SocketServer.prototype.createServer = function () {
    this.redisClient = redis.createClient()
    this.redisClient.get = promisify(this.redisClient.get)
    this.redisClient.set = promisify(this.redisClient.set)
    this.chatApp = io(80);
}


// io dependent
SocketServer.prototype.use = function () {
    this.chatApp.use((socket, next) => {
        try {
            next()
        } catch (error) {
            console.log(error);
        }
    })
}

SocketServer.prototype.listen = function () {
    this.chatApp.on(CONNECT, (socket) => {
        this.getAllRoom(socket)
        this.getAllClientOf(socket)

        this.onTypingMessage(socket)
        this.onNewMessage(socket)
        this.getAllMessages(socket)

        this.onAddProblem(socket)
        this.getAllProblems(socket)

        this.onAddSolution(socket)
        this.getAllSolution(socket)
        this.onRunSolution(socket)

        this.onJoinRoom(socket)
        this.onLeaveRoom(socket)
        this.onDisconnecting(socket)
    })
}


//
// socket dependent
//


// rooms start
SocketServer.prototype.getAllRoom = function (socket) {
    socket.on(ALL_ROOM, (nsp = '/', responseCallback) => {
        let allRooms = Object.keys(this.chatApp.of(nsp).adapter.rooms)
        responseCallback(allRooms)
    })
}


SocketServer.prototype.getAllClientOf = function (socket) {
    socket.on(ALL_CLIENT_IN_ROOM, (room, responseCallback) => {
        this.chatApp.in(room).clients((error, clientList) => {
            if (error) {
                console.log("All CLIENT ROOM ERROR : ", error);
                responseCallback([])
                return;
            }
            let usersInfo = clientList.map(clientID => this.redisClient.get(clientID))
            Promise.all(usersInfo).then(users => responseCallback(users.map(user => JSON.parse(user))))
        })
    })
}


SocketServer.prototype.onJoinRoom = function (socket) {
    socket.on(JOIN_ROOM, (userInfo, ackCallback) => {
        socket.join(userInfo.userRoom, (error) => {
            if (error) {
                console.log("JOIN ROOM ERROR : ", error);
                ackCallback(error.message)
            }
            userInfo.userId = socket.id
            this.redisClient.set(socket.id, JSON.stringify(userInfo))
            this.broadcastToRoom(NEW_JOINING_ROOM, userInfo.userRoom, userInfo)
            ackCallback()
        })
    })
}

SocketServer.prototype.onLeaveRoom = function (socket) {
    socket.on(LEAVE_ROOM, (room, ackCallback) => {
        socket.leave(room, (error) => {
            if (error) {
                console.log("LEAVE ROOM ERROR : ", error);
                ackCallback(error.message)
            }
            ackCallback()
            this.broadcastToRoom(LEFT_ROOM, room, socket.id)
        })
    })
}


// action

SocketServer.prototype.onDisconnecting = function (socket) {
    socket.on(DISCONNECTING, () => {
        Object.keys(socket.rooms).map(room => this.broadcastToRoom(LEFT_ROOM, room, socket.id))
    })
}

SocketServer.prototype.onTypingMessage = function (socket) {
    socket.on(MESSAGE_TYPING, (room, userIfo) => {
        socket.to(room).emit(MESSAGE_TYPING, userIfo)
    })
}

SocketServer.prototype.onNewMessage = function (socket) {
    socket.on(NEW_MESSAGE, ({ room, payload }, ackCallback) => {
        payload.timeStamp = new Date();
        this.redisClient.rpush([`${room}:messages`, JSON.stringify(payload)], redis.print)
        ackCallback()
        this.broadcastToRoom(NEW_MESSAGE, room, payload)
    })
}

SocketServer.prototype.getAllMessages = function (socket) {
    socket.on(ALL_MESSAGE, (room, callback) => {
        this.redisClient.lrange(`${room}:messages`, 0, -1, (error, messages = []) => {
            if (error) {
                console.log("GET ALL SMS ERROR : ", error.message);
                callback([])
            }
            let parsedMessages = messages.map(message => JSON.parse(message))
            callback(parsedMessages)
        })
    })
}

SocketServer.prototype.onAddProblem = function (socket) {
    socket.on(NEW_PROBLEM, ({ room, payload }, ackCallback) => {
        payload.timeStamp = new Date()
        this.redisClient.set(`${room}:problem`, JSON.stringify(payload)).then(res => {
            ackCallback()
            this.broadcastToRoom(NEW_PROBLEM, room, payload)
        }).catch(error => ackCallback(error.message))
    })
}

SocketServer.prototype.getAllProblems = function (socket) {
    socket.on(ALL_PROBLEM, (room, callback) => {
        this.redisClient.get(`${room}:problem`).then(problem => callback(JSON.parse(problem || "{}"))).catch(err => callback({}))
        // this.redisClient.get(`${room}:problems`, 0, -1, (error, problems = []) => {
        //     if (error) throw error
        //     let parsedProblems = problems.map(problem => JSON.parse(problem))
        //     callback(parsedProblems)
        // })
    })
}

SocketServer.prototype.onAddSolution = function (socket) {
    socket.on(NEW_SOLUTION, ({ room, payload }, ackCallback) => {
        payload.timeStamp = new Date()
        this.redisClient.rpush([`${room}:solutions`, JSON.stringify(payload)], redis.print)
        ackCallback()
        this.broadcastToRoom(NEW_SOLUTION, room, payload)
    })
}

SocketServer.prototype.getAllSolution = function (socket) {
    socket.on(ALL_SOLUTION, (room, callback) => {
        this.redisClient.lrange(`${room}:solutions`, 0, -1, (error, solutions = []) => {
            if (error) {
                console.log("GET ALL SOLUTION ERROR : ", error);
                callback([])
            }
            let parsedSolutions = solutions.map(solution => JSON.parse(solution))
            callback(parsedSolutions)
        })
    })
}

SocketServer.prototype.onRunSolution = function (socket) {
    socket.on(RUN_SOLUTION, (payload, callback) => {
        new EvaluateSourceCode(payload).runCode(callback)
    })
}



SocketServer.prototype.broadcastToRoom = function (event, room, message) {
    this.chatApp.in(room).emit(event, message)
}
// rooms start





// singleton
const socketServer = new SocketServer()

export default socketServer