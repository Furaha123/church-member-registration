// Shape returned by UserResource (see AuthController::login / logout).
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  must_change_password: boolean;
  created_at: string | null;
}
