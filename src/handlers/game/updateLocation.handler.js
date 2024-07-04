import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handlerError } from '../../utils/error/errorHandler.js';

// 클라이언트에게 서버가 갱신된 위치를 전송받았을 때 사용하는 핸들러
// LocationUpdatePayload = {x, y}
const updateLocationHandler = ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;
    const gameSession = getGameSession();

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    // console.log("gameSession", gameSession);
    // console.log("userId", userId);

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // 서버에서 해당 유저 위치 동기화.
    user.updatePosition(x, y);

    // 다른 유저들의 동기화 위치를 패킷으로 제작 및 전송.
    const packet = gameSession.getAllLocation(userId);
    socket.write(packet);
    
  } catch (e) {
    handlerError(socket, e);
  }
};

export default updateLocationHandler;
