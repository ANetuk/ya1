namespace RobotState {
    export type WashState = 'water' | 'soap' | 'brush';

    export interface RobotState {
        x: number;
        y: number;
        angle: number;
        washState: WashState;
    }

    export function move(state: RobotState, distance: number) {
        const radians = (state.angle * Math.PI) / 180;
        const x = state.x + distance * Math.cos(radians);
        const y = state.y + distance * Math.sin(radians);
        return {...state, x, y};
    }

    export function turn(state: RobotState, turnAngel: number) {
        let angle = (state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        return {...state, angle};
    }

    export function set(state: RobotState, washState: WashState) {
        return {...state, washState};
    }
}

namespace RobotCommand {
    export function move(robotState: RobotState.RobotState, distance: number) {
        const nextRobotState = RobotState.move(robotState, distance);
        console.log(`POS x=${nextRobotState.x}, y=${nextRobotState.y}`);
        return nextRobotState;
    }

    export function turn(robotState: RobotState.RobotState, angle: number) {
        const nextRobotState = RobotState.turn(robotState, angle);
        console.log(`ANGLE ${nextRobotState.angle}`);
        return nextRobotState;
    }

    export function set(robotState: RobotState.RobotState, washState: RobotState.WashState) {
        const nextRobotState = RobotState.set(robotState, washState);
        console.log(`STATE ${nextRobotState.washState}`);
        return nextRobotState;
    }

    export function start(robotState: RobotState.RobotState) {
        console.log(`START WITH ${robotState.washState}`);
        return robotState;
    }

    export function stop(robotState: RobotState.RobotState) {
        console.log('STOP');
        return robotState;
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

commands.map(command => {
    const words = command.split(' ');
    const [commandName, param] = words;
    if (commandName === 'move') {
        return (robotState: RobotState.RobotState) => RobotCommand.move(robotState, Number(param))
    }
    if (commandName === 'turn') {
        return (robotState: RobotState.RobotState) => RobotCommand.turn(robotState, Number(param))
    }
    if (commandName === 'set') {
        return (robotState: RobotState.RobotState) => RobotCommand.set(robotState, param as RobotState.WashState)
    }
    if (commandName === 'stop') {
        return RobotCommand.stop
    }
    if (commandName === 'start') {
        return RobotCommand.start
    }
    return (robotState: RobotState.RobotState) => robotState;
}).reduce(
    (robotState: RobotState.RobotState, command) => command(robotState),
    {x: 0, y: 0, angle: 0, washState: 'water'}
);
