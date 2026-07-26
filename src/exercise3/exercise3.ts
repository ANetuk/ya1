type WashState = 'water' | 'soap' | 'brush';

class RobotState {
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

    public move(this: RobotState, distance: number) {
        const radians = (this.angle * Math.PI) / 180;
        this._x += distance * Math.cos(radians);
        this._y += distance * Math.sin(radians);
    }

    public turn(this: RobotState, turnAngel: number) {
        this._angle = (this._angle + turnAngel) % 360;
        if (this._angle < 0) {
            this._angle += 360;
        }
    }

    public set(this: RobotState, washState: WashState) {
        this._washState = washState;
    }
}

class Robot {
    private _robotState = new RobotState();

    public move(this: Robot, distance: number) {
        this._robotState.move(distance);
        console.log(`POS x=${this._robotState.x}, y=${this._robotState.y}`);
    }

    public turn(this: Robot, angle: number) {
        this._robotState.turn(angle);
        console.log(`ANGLE ${this._robotState.angle}`);
    }

    public set(this: Robot, washState: WashState) {
        this._robotState.set(washState);
        console.log(`STATE ${this._robotState.washState}`);
    }

    public start(this: Robot) {
        console.log(`START WITH ${this._robotState.washState}`);
    }

    public stop(this: Robot) {
        console.log('STOP');
    }
}

const commands: string[] = [
    'move 100',
    'turn -90',
    'set soap',
    'start',
    'move 50',
    'stop'
];

const robot = new Robot();

commands.forEach(command => {
    const words = command.split(' ');
    const [commandName, param] = words;
    if (commandName === 'move') {
        robot.move(Number(param));
    }
    if (commandName === 'turn') {
        robot.turn(Number(param));
    }
    if (commandName === 'set') {
        robot.set(param as WashState);
    }
    if (commandName === 'stop') {
        robot.stop();
    }
    if (commandName === 'start') {
        robot.start();
    }
})
