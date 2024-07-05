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

    // x, y축 변화량 저장.
    const dx = this.x - this.prevX;
    const dy = this.y - this.prevY;

    // 기울기 각도와 이동 거리를 구함
    
    const theta = dx > 0 ? Math.atan(dy/dx) : 90;
    const distance = speed * timeDiff; // 거리 = 속력 * 시간

    setTimeout(function(){
      console.log("this.x, this.prevX, this.y, this.prevY", this.x, this.prevX, this.y, this.prevY);
      console.log("dx, dy, theta, distance", dx, dy, theta, distance);
    }, 500);


    return {
      x: this.x + Math.cos(theta)*distance,
      y: this.y + Math.sin(theta)*distance,
      // x: this.x,
      // y: this.y
    };
  }
  
}

export default User;
