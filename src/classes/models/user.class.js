class User {
  constructor(socket, deviceId, playerId, latency) {
    this.id = deviceId;
    this.socket = socket;
    this.playerId = playerId;
    this.latency = latency;
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.lastUpdateTime = Date.now();
  }

  updatePosition(x, y) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  calculatePosition(latency) {
    const timeDiff = (Date.now() - this.lastUpdateTime + latency) / 1000; // ms -> s로 단위 변경
    const speed = 3; // 초당 3이동으로 클라에서 정의되어있음

    // x, y축 유닛 벡터 저장.
    const dir_x = this.x - this.prevX > 0 ? 1 : -1;
    const dir_y = this.y - this.prevY > 0 ? 1 : -1;

    const distance = speed * timeDiff;

    return {
      x: this.x + dir_x*distance,
      y: this.y + dir_y*distance
      // x: this.x,
      // y: this.y
    };
  }
  
}

export default User;
