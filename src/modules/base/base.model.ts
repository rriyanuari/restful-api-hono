export interface BaseResponse {
  uid: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export function toBaseResponse(data: BaseResponse): BaseResponse {
  return {
    uid: data.uid,
    created_at: data.created_at,
    updated_at: data.updated_at,
    deleted_at: data.deleted_at,
  };
}