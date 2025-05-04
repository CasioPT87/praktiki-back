import { Connection } from '../../../managers/call';
import { PrivateChat } from '../../../types/entities';
import { DisconnectionReason } from './videoChat';

const accept = ({ privateChatId }: { privateChatId: string }) => {
  try {
    const privateChatRequest =
      globalPrivateChatsManager.acceptRequest(privateChatId);
    if (!privateChatRequest) return;
    const creatorUserId = privateChatRequest.creatorUserId;
    const targetUserId = privateChatRequest.targetUserId;
    const creator =
      globalPrivateChatUsersManager.getUserByUserId(creatorUserId);
    const target = globalPrivateChatUsersManager.getUserByUserId(targetUserId);
    if (!creator || !target) return;
    const creatorSocket = videoIO.sockets.get(creator.socketId);
    const targetSocket = videoIO.sockets.get(target.socketId);
    if (!creatorSocket || !targetSocket) return;

    creatorSocket.join(privateChatId);
    targetSocket.join(privateChatId);

    creatorSocket.emit('private-chat:start', {
      creator: true,
      target: false,
      privateChatId,
    });
    targetSocket.emit('private-chat:start', {
      creator: false,
      target: true,
      privateChatId,
    });
  } catch (e) {
    if (e instanceof Error) console.error(e.stack);
  }
};

export const createdOffer = ({
  offer,
  privateChatId,
}: {
  offer: RTCSessionDescriptionInit;
  privateChatId: string;
}) => {
  const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
    id: privateChatId,
    state: Connection.onGoing,
  });
  if (!privateChatRequest) return;
  privateChatRequest
    .getSocketFromUserId(privateChatRequest.targetUserId)
    .then((socketToSend) => {
      if (!socketToSend) return;
      socketToSend.emit('offer:create', offer);
    });
};

export const answerOffer = ({
  offerAnswer,
  privateChatId,
}: {
  offerAnswer: RTCSessionDescriptionInit;
  privateChatId: string;
}) => {
  const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
    id: privateChatId,
    state: Connection.onGoing,
  });
  if (!privateChatRequest) return;
  privateChatRequest
    .getSocketFromUserId(privateChatRequest.creatorUserId)
    .then((socketToSend) => {
      if (!socketToSend) return;
      socketToSend.emit('offer:answer', offerAnswer);
    });
};

export const createdIceCandidate = ({
  iceCandidate,
  privateChatId,
  isCreator,
}: {
  iceCandidate: RTCIceCandidateInit;
  privateChatId: string;
  isCreator: boolean;
}) => {
  const privateChatRequest = globalPrivateChatsManager.getByIdAndState({
    id: privateChatId,
    state: Connection.onGoing,
  });
  if (!privateChatRequest) return;
  privateChatRequest
    // is its the creator we want to send it to the target and viceversa
    .getSocketFromUserId(
      isCreator
        ? privateChatRequest.targetUserId
        : privateChatRequest.creatorUserId
    )
    .then((targetSocket) => {
      if (!targetSocket) return;
      targetSocket.emit('ice-candidates:create', iceCandidate);
    });
};

export default {
  accept,
  createdOffer,
  answerOffer,
  createdIceCandidate,
};
