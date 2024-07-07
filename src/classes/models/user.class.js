class User {
  constructor(socket, deviceId, playerId, latency) {
    this.id = deviceId;
    this.socket = socket;
    this.playerId = playerId;
    this.latency = latency;
    this.x = 0;
    this.y = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.lastUpdateTime = Date.now();
    this.speed = 3; // 초당 3이동으로 클라에서 정의되어있음
  }

  updatePosition(dirX, dirY) {
    const timeDiff = (Date.now() - this.lastUpdateTime) / 1000;
    const distance = this.speed * timeDiff;
    this.dirX = dirX;
    this.dirY = dirY;
    this.x += distance*dirX;
    this.y += distance*dirY;
    this.lastUpdateTime = Date.now();
  }

  calculatePosition(maxLatency, latency) {
    const timeDiff = (this.latency + latency) / 1000; // ms -> s로 단위 변경
    
    const distance = this.speed * timeDiff;
    //console.log("timeDiff, distance", timeDiff, distance);
    return {
      x: this.x + distance*this.dirX,
      y: this.y + distance*this.dirY
      // x: this.x,
      // y: this.y
    };
  }
  
}

export default User;
