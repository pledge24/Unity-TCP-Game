import { getProtoMessages } from '../../init/loadProtos.js';
import { getProtoTypeNameByHandlerId } from '../../handlers/index.js';
import { config } from '../../config/config.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

// 클라이언트에서 온 패킷을 파싱하는 함수
export const packetParser = (data) => {
  const protoMessages = getProtoMessages();
  // 공통 패킷 바이트배열 -> 객체로 디코딩합니다.
  // 공통 패킷: {handlerId, userId, version, payload}
  const Packet = protoMessages.common.Packet;
  let packet;
  try {
    packet = Packet.decode(data);
  } catch (e) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  const handlerId = packet.handlerId;
  const userId = packet.userId;
  const clientVersion = packet.version;

  // 클라이언트가 가지고 있는 버전과 일치하는 지 검증
  if (clientVersion !== config.client.version) {
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }

  // 핸들러ID를 통해 프로토타입이름을 가져옵니다 예시) initial.InitialPacket
  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, `알 수 없는 핸들러 ID: ${handlerId}`);
  }

  // 예시) namespace = initial, typeName = InitialPacket
  const [namespace, typeName] = protoTypeName.split('.');
  const PayloadType = protoMessages[namespace][typeName];
  let payload;

  // 페이로드를 바이트배열 -> 객체로 디코딩합니다.
  try {
    payload = PayloadType.decode(packet.payload);
    //console.log("Received payload", payload);
  } catch (e) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  // 패킷 구조 검증
  const errorMessage = PayloadType.verify(payload);
  if (errorMessage) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `패킷 구조가 일치하지 않습니다: ${errorMessage}`,
    );
  }

  // 필드가 비어있는 경우 = 필수 필드가 누락된 경우
  const expectedFields = Object.keys(PayloadType.fields);
  const actualFields = Object.keys(payload);
  const missingFields = expectedFields.filter((field) => !actualFields.includes(field));

  if (missingFields.length > 0) {
    throw new CustomError(
      ErrorCodes.MISSING_FIELDS,
      `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
    );
  }

  return { handlerId, userId, payload };
};
