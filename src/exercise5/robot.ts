import {RobotState, WashState} from './robotState';

export class Robot {
    private _robotState = new RobotState();

    private move(this: Robot, distance: number) {
        this._robotState.move(distance);
        console.log(`POS x=${this._robotState.x}, y=${this._robotState.y}`);
    }

    private turn(this: Robot, angle: number) {
        this._robotState.turn(angle);
        console.log(`ANGLE ${this._robotState.angle}`);
    }

    private set(this: Robot, washState: WashState) {
        this._robotState.set(washState);
        console.log(`STATE ${this._robotState.washState}`);
    }

    private start(this: Robot) {
        console.log(`START WITH ${this._robotState.washState}`);
    }

    private stop(this: Robot) {
        console.log('STOP');
    }

    public run(this: Robot, commands: string[]) {
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
