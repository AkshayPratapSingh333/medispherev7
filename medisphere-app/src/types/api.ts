// types/api.ts
export type ApiResponse<T> = {
  ok?: boolean;
  error?: string;
  data?: T;
};
