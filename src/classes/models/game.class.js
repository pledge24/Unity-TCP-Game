import IntervalManager from '../managers/interval.manager.js';
import { createLocationPacket } from '../../utils/notification/game.notification.js';

const MAX_PLAYERS = 4;

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
  }

  addUser(user) {
    if (this.users.length >= MAX_PLAYERS) {
      throw new Error('Game session is full');
    }
    this.users.push(user);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(socket) {
    const index = this.users.findIndex((user) => user.socket === socket);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  getAllLocation(thisUserId) {
    const maxLatency = this.getMaxLatency();

    const locationData = this.users
      .filter((user) => user.id !== thisUserId)
      .map((user) => {
        const { x, y } = user.calculatePosition(maxLatency);
        return { id: user.id, playerId: user.playerId, x, y };
      });

    const notThisUserLocationData = locationData.filter((data) => data.id !== thisUserId);
    console.log(notThisUserLocationData);
    return createLocationPacket(notThisUserLocationData);
  }
}

export default Game;
