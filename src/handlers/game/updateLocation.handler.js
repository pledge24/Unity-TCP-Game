import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handlerError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';

// 서버 -> 클라이언트로 갱신된 캐릭터 위치를 전송할 때 사용하는 핸들러
// LocationUpdatePayload = {dirX, dirY}
const updateLocationHandler = ({ socket, userId, payload }) => {
  try {
    const { dirX, dirY } = payload;
   
    const gameSession = getGameSession();

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }
    
    // 서버에서 해당 유저 위치 동기화.
    user.updatePosition(dirX, dirY);
    const maxLatency = gameSession.getMaxLatency();
    const {x, y} = user.calculatePosition(maxLatency, user.latency);
    const positionResponse = createResponse(HANDLER_IDS.UPDATE_LOCATION, RESPONSE_SUCCESS_CODE, {
      x, y
    });

    // 다른 유저들의 동기화 위치를 패킷으로 제작 및 latency만큼 딜레이 후 전송.
    const packet = gameSession.getAllLocation(userId, user.latency);

    // 서버 -> 클라이언트 레이턴시 적용.
    const sleep = (ms) => {
      return new Promise((r) => setTimeout(r, ms));
    }
    
    sleep(user.latency).then(() => {
      socket.write(positionResponse);
      socket.write(packet);
    });
  

  } catch (e) {
    handlerError(socket, e);
  }
};

export default updateLocationHandler;
