export declare function generateToken(userID: string, roomID: string, userName: string): Promise<{
    token: string;
}>;
export declare function randomID(len: number): string;
export declare function getRandomName(): string;
