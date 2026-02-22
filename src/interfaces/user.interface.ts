export interface IUser{
    id: string;
    full_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface AccessTokenPayload {
    userID: string;
    email: string;
}


export interface OtpTokenPayload {
    email: string;
    secret: string;
}