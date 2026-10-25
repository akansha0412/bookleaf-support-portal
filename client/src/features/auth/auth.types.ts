export type User = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AUTHOR';
};

export type Auth = {
  token: string;
  user: User;
};

export type MeResponse = {
  success: boolean;
  data: { user: User };
};

export type LoginResult = {
  success: boolean;
  data: Auth;
};
