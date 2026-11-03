export type User = { id: number; name: string; email: string };
export type Course = { id: number; name: string; price: number };

// user-service answers with a message, plus `user`/`users` on success.
export type UserResult = { message: string; user?: User };
export type UsersResult = { message: string; users: User[] };
