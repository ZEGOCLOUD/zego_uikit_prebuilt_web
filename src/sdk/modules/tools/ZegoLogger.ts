export class ZegoLogger {
    static getFormatString(moduleName: string): string {
        return `[ZEGOCLOUD] [${moduleName}]`;
    }

    static log(moduleName: string, ...args: any[]) {
        console.log(this.getFormatString(moduleName), ...args);
    }

    static warn(moduleName: string, ...args: any[]) {
        console.warn(this.getFormatString(moduleName), ...args);
    }

    static error(moduleName: string, ...args: any[]) {
        console.error(this.getFormatString(moduleName), ...args);
    }

    static info(moduleName: string, ...args: any[]) {
        console.info(this.getFormatString(moduleName), ...args);
    }
}
