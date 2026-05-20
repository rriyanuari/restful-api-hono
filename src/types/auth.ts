export type JwtPayload = {
  sub: string
  exp: number
}

export type CrudPermissions = {
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
};