// types/chat.ts
export interface ChatMessageDTO {
  id: string;
  appointmentId: string;
  senderId: string;
  senderType: "DOCTOR" | "PATIENT";
  message: string;
  messageType?: "text" | "image" | "file";
  timestamp: string;
}
