import { userSessions } from './sessions.js';
import User from '../classes/models/user.class.js';

// 유저 세션에 유저 추가. initial에만 사용한다.
export const addUser = (socket, uuid, playerId, latency) => {
  const user = new User(socket, uuid, playerId, latency);
  userSessions.push(user);
  return user;
};

// 유저 세션에서 유저 제거.
export const removeUser = (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);
  if (index !== -1) {
    return userSessions.splice(index, 1)[0];
  }
};

// 특정 유저 정보 조회
export const getUserById = (id) => {
  return userSessions.find((user) => user.id === id);
};

// 특정 유저 소켓 정보 조회
export const getUserBySocket = (socket) => {
  return userSessions.find((user) => user.socket === socket);
};

// 접속한 모든 유저 조회
export const getAllUsers = () => {
  return userSessions;
};
