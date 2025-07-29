export interface JwtPayload {
  sub: string;      // o number, según lo que sea tu ID
  exp: number;      // fecha de expiración
  iat: number;      // fecha de emisión
}