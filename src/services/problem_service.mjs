import {
  NEW_PROBLEM,
  ALL_PROBLEM,
  REMOVE_PROBLEM,
} from "../sockets/EventType.mjs";
import redis from "redis";
const ProblemService = function (redisClient, socket, chatApp) {
  this.redisClient = redisClient;
  this.socket = socket;
  this.chatApp = chatApp;
};
ProblemService.prototype.listen = function () {
  this.onAddProblem();
  this.getAllProblems();
  this.removeProblem();
};

ProblemService.prototype.onAddProblem = function () {
  this.socket.on(NEW_PROBLEM, ({ room, payload }, ackCallback) => {
    payload.timeStamp = new Date();
    this.redisClient
      .set(`${room}:problem`, JSON.stringify(payload))
      .then((res) => {
        ackCallback();
        this.broadcastToRoom(NEW_PROBLEM, room, payload);
      })
      .catch((error) => ackCallback(error.message));
  });
};

ProblemService.prototype.getAllProblems = function () {
  this.socket.on(ALL_PROBLEM, (room, callback) => {
    this.redisClient
      .get(`${room}:problem`)
      .then((problem) => callback(JSON.parse(problem || "{}")))
      .catch((err) => callback({}));
  });
};

ProblemService.prototype.removeProblem = function () {
  this.socket.on(REMOVE_PROBLEM, ({ room }, ackCallback) => {
    this.redisClient
      .set(`${room}:problem`, JSON.stringify({}))
      .then((res) => {
        ackCallback();
        this.broadcastToRoom(NEW_PROBLEM, room, {});
      })
      .catch((error) => ackCallback(error.message));
  });
};

ProblemService.prototype.broadcastToRoom = function (event, room, message) {
  this.chatApp.in(room).emit(event, message);
};
export default ProblemService;
