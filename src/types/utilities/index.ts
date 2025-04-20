type Message = {
  content: string;
  created: Date;
};

export interface NotificationMessage extends Message {}
export interface LocationChatClientMessage extends Message {}
export interface PrivateChatMessage extends Message {}
