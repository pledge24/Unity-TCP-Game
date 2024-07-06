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
    this.updateMaxLatency();
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

  // 유저 중 가장 구린 지연율을 반환
  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    console.log("maxLatency", maxLatency);
    return maxLatency;
  }

  getAllLocation(thisUserId) {
    const maxLatency = this.getMaxLatency();

    // 추측 항법을 적용한 다른 유저들의 위치값을 저장.
    const locationData = this.users
      .filter((user) => user.id !== thisUserId)
      .map((user) => {
        const { x, y } = user.calculatePosition(maxLatency);
        return { id: user.id, playerId: user.playerId, x, y };
      });

    const notThisUserLocationData = locationData.filter((data) => data.id !== thisUserId);
    if(notThisUserLocationData.length !== 0){
      console.log(notThisUserLocationData);
    }
    
    return createLocationPacket(notThisUserLocationData);
  }

  updateMaxLatency(){
    clearInterval(this.interval);
    this.startSendingSyncLocation();
  }

  startSendingSyncLocation() {
    const maxLatency = this.getMaxLatency(); 
    this.interval = setInterval(() => {
      for(const user of this.users){
        console.log(`user: ${user.id}, user.latency, ${user.latency}`);
        const packet = this.getAllLocation(user.id);
        user.socket.write(packet);
      }
    }, maxLatency);
  }
}

export default Game;
