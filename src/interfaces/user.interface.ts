export interface IUser{
    id: string;
    full_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface JWTPayload {
    userID: string;
    email: string;
}
