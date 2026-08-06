type WashState = 'water' | 'soap' | 'brush';

interface ICleanerApi {
    x: number;
    y: number;
    angle: number;
    washState: WashState;
    activateCleaner: (commands: string[]) => void;
}

class CleanerApi implements ICleanerApi {
    private _x: number = 0;
    public get x() {
        return this._x;
    }

    private _y: number = 0;
    public get y() {
        return this._y;
    }

    private _angle: number = 0;
    public get angle() {
        return this._angle;
    }

    private _washState: WashState = 'water';
    public get washState() {
        return this._washState;
    }

    private transferToCleaner(this: CleanerApi, message: string) {
        console.log(message);
    }

    private move(this: CleanerApi, distance: number) {
        const radians = (this.angle * Math.PI) / 180;
        this._x += distance * Math.cos(radians);
        this._y += distance * Math.sin(radians);
        this.transferToCleaner(`POS x=${this._x}, y=${this._y}`);
    }

    private turn(this: CleanerApi, turnAngel: number) {
        this._angle = (this._angle + turnAngel) % 360;
        if (this._angle < 0) {
            this._angle += 360;
        }
        this.transferToCleaner(`ANGLE ${this._angle}`);
    }

    private set(this: CleanerApi, washState: WashState) {
        this._washState = washState;
        this.transferToCleaner(`STATE ${this._washState}`);
    }

    private start(this: CleanerApi) {
        this.transferToCleaner(`START WITH ${this._washState}`);
    }

    private stop(this: CleanerApi) {
        this.transferToCleaner('STOP');
    }

    public activateCleaner(this: CleanerApi, commands: string[]) {
        commands.forEach(command => {
            const words = command.split(' ');
            const [commandName, param] = words;
            if (commandName === 'move') {
                this.move(Number(param));
            }
            if (commandName === 'turn') {
                this.turn(Number(param));
            }
            if (commandName === 'set') {
                this.set(param as WashState);
            }
            if (commandName === 'stop') {
                this.stop();
            }
            if (commandName === 'start') {
                this.start();
            }
        })
    }
}

class DIContainer {
    public static getCleanerApi(): ICleanerApi {
        return new CleanerApi();
    }
}

const cleanerApi = DIContainer.getCleanerApi();
cleanerApi.activateCleaner([
    'move 100',
    'turn -90',
    'set soap',
    'start',
    'move 50',
    'stop'
]);

console.log(
    cleanerApi.x,
    cleanerApi.y,
    cleanerApi.angle,
    cleanerApi.washState
)
