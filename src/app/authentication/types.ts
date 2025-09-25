export interface RegisterDTO {
    email:string;
    password:string;
}

export interface CredentialDTO {
    email:string;
    password:string;
}

export interface User {
    id:string;
    email:string;
    password: string;
    role:string;
}

export interface LoginResponseDTO {
    token:string;
    user:User;
}