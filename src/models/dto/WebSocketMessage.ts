export interface WebSocketMessage<T> {
  type: string;
  data: T;
}
