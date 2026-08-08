namespace RobotState {
    export type WashState = 'water' | 'soap' | 'brush';

    export interface RobotState {
        x: number;
        y: number;
        angle: number;
        washState: WashState;
    }

    export type Transfer = (message: string) => void;

    export function move(transfer: Transfer, distance: number, state: RobotState) {
        const radians = (state.angle * Math.PI) / 180;
        const x = state.x + distance * Math.cos(radians);
        const y = state.y + distance * Math.sin(radians);
        const nextState = {...state, x, y}
        transfer(`POS x=${nextState.x}, y=${nextState.y}`);
        return nextState;
    }

    export function turn(transfer: Transfer, turnAngel: number, state: RobotState) {
        let angle = (state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        const nextState = {...state, angle};
        transfer(`ANGLE ${nextState.angle}`);
        return nextState;
    }

    export function set(transfer: Transfer, washState: WashState, state: RobotState) {
        const nextState = {...state, washState};
        transfer(`STATE ${nextState.washState}`);
        return nextState;
    }

    export function start(transfer: Transfer, state: RobotState) {
        transfer(`START WITH ${state.washState}`);
        return state;
    }

    export function stop(transfer: Transfer, state: RobotState) {
        transfer('STOP');
        return state;
    }
}

interface RobotFunctions {
    transfer: (message: string) => void;
    move: (transfer: RobotState.Transfer, distance: number, state: RobotState.RobotState) => RobotState.RobotState;
    turn: (transfer: RobotState.Transfer, turnAngel: number, state: RobotState.RobotState) => RobotState.RobotState;
    set: (
        transfer: RobotState.Transfer,
        washState: RobotState.WashState,
        state: RobotState.RobotState
    ) => RobotState.RobotState;
    stop: (transfer: RobotState.Transfer, state: RobotState.RobotState) => RobotState.RobotState;
    start: (transfer: RobotState.Transfer, state: RobotState.RobotState) => RobotState.RobotState;
}

class RobotApi {
    private robotState: RobotState.RobotState;
    private robotFunctions: RobotFunctions;
    constructor(robotFunctions: RobotFunctions) {
        this.robotState = {x: 0, y: 0, angle: 0, washState: 'water'};
        this.robotFunctions = robotFunctions;
    }

    public make(commands: string[]) {
        this.robotState = commands.map(command => {
            const words = command.split(' ');
            const [commandName, param] = words;
            if (commandName === 'move') {
                return (robotState: RobotState.RobotState) => this.robotFunctions.move(
                    this.robotFunctions.transfer,
                    Number(param),
                    robotState
                )
            }
            if (commandName === 'turn') {
                return (robotState: RobotState.RobotState) => this.robotFunctions.turn(
                    this.robotFunctions.transfer,
                    Number(param),
                    robotState
                )
            }
            if (commandName === 'set') {
                return (robotState: RobotState.RobotState) => this.robotFunctions.set(
                    this.robotFunctions.transfer,
                    param as RobotState.WashState,
                    robotState
                )
            }
            if (commandName === 'stop') {
                return (robotState: RobotState.RobotState) => this.robotFunctions.stop(
                    this.robotFunctions.transfer,
                    robotState
                )
            }
            if (commandName === 'start') {
                return (robotState: RobotState.RobotState) => this.robotFunctions.start(
                    this.robotFunctions.transfer,
                    robotState
                )
            }
            return (robotState: RobotState.RobotState) => robotState;
        }).reduce(
            (robotState: RobotState.RobotState, command) => command(robotState),
            this.robotState
        )
    }
}

const robot = new RobotApi({
    transfer: console.log,
    move: RobotState.move,
    turn: RobotState.turn,
    set: RobotState.set,
    stop: RobotState.stop,
    start: RobotState.start
});

robot.make([
    'move 100',
    'turn -90',
    'set soap',
    'start',
    'move 50',
    'stop'
]);
