export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role_id: number;
}
export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: string;
  active: boolean;
  created_at: Date;
}
export interface UpdateUserDto {
  name?: string;
  email?: string;
  role_id?: number;
}
export interface UpdatePasswordDto {
  password: string;
}
