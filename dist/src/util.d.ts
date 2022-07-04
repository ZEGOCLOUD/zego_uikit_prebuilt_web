export declare function generateToken(tokenServerUrl: string, userID: string, roomID: string, userName: string): Promise<{
    token: string;
}>;
export declare function randomID(len: number): string;
