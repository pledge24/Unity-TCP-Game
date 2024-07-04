import { addUser } from '../../session/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { handlerError } from '../../utils/error/errorHandler.js';
import { getGameSession } from '../../session/game.session.js';

// 초기화 핸들러. 클라이언트에게 접속 요청을 받을 때 사용한다.
// InitialPayload: {deviceId, playerId, latency}
const initialHandler = async ({ socket, userId, payload }) => {
  try {
    const { deviceId, latency, playerId } = payload;

    // 유저 세션에 해당 유저 추가, 해당 유저 게임 세션에 추가.
    // 게임 세션이 1개이기 때문에 방이라는 개념이 없어
    // createGame, joinGame 핸들러 대신 여기서 게임 세션을 추가한다.
    const user = addUser(socket, deviceId, playerId, latency);
    const gameSession = getGameSession();
    gameSession.addUser(user);

    // 초기화 핸들러를 성공적으로 처리했을경우, 응답 패킷 만들어 클라이언트에게 전송한다.
    const initialResponse = createResponse(HANDLER_IDS.INITIAL, RESPONSE_SUCCESS_CODE, {
      userId: deviceId,
    });

    socket.write(initialResponse);
  } catch (e) {
    handlerError(socket, e);
  }
};

export default initialHandler;
