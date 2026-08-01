namespace RobotState {
    export type WashState = 'water' | 'soap' | 'brush';

    export interface RobotState {
        x: number;
        y: number;
        angle: number;
        washState: WashState;
    }

    export function move(distance: number, state: RobotState) {
        const radians = (state.angle * Math.PI) / 180;
        const x = state.x + distance * Math.cos(radians);
        const y = state.y + distance * Math.sin(radians);
        return {...state, x, y};
    }

    export function turn(turnAngel: number, state: RobotState) {
        let angle = (state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        return {...state, angle};
    }

    export function set(washState: WashState, state: RobotState) {
        return {...state, washState};
    }
}

namespace RobotCommand {
    type Transfer = (message: string) => void;

    export function move(transfer: Transfer, distance: number, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.move(distance, robotState);
        transfer(`POS x=${nextRobotState.x}, y=${nextRobotState.y}`);
        return nextRobotState;
    }

    export function turn(transfer: Transfer, angle: number, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.turn(angle, robotState);
        transfer(`ANGLE ${nextRobotState.angle}`);
        return nextRobotState;
    }

    export function set(transfer: Transfer, washState: RobotState.WashState, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.set(washState, robotState);
        transfer(`STATE ${nextRobotState.washState}`);
        return nextRobotState;
    }

    export function start(transfer: Transfer, robotState: RobotState.RobotState) {
        transfer(`START WITH ${robotState.washState}`);
        return robotState;
    }

    export function stop(transfer: Transfer, robotState: RobotState.RobotState) {
        transfer('STOP');
        return robotState;
    }

    export function make(transfer: Transfer, commands: string[], robotState: RobotState.RobotState) {
        return commands.map(command => {
            const words = command.split(' ');
            const [commandName, param] = words;
            if (commandName === 'move') {
                return (robotState: RobotState.RobotState) => move(transfer, Number(param), robotState)
            }
            if (commandName === 'turn') {
                return (robotState: RobotState.RobotState) => turn(transfer, Number(param), robotState)
            }
            if (commandName === 'set') {
                return (robotState: RobotState.RobotState) => set(transfer, param as RobotState.WashState, robotState)
            }
            if (commandName === 'stop') {
                return (robotState: RobotState.RobotState) => stop(transfer, robotState)
            }
            if (commandName === 'start') {
                return (robotState: RobotState.RobotState) => start(transfer, robotState)
            }
            return (robotState: RobotState.RobotState) => robotState;
        }).reduce(
            (robotState: RobotState.RobotState, command) => command(robotState),
            robotState
        )
    }
}

namespace RobotApi {
    const defaultRobotState: RobotState.RobotState = {x: 0, y: 0, angle: 0, washState: 'water'};
    const transfer = console.log;
    const robots: Record<number, RobotState.RobotState | undefined> = {};

    export function make(id: number, commands: string[]) {
        const robotState = robots[id] ?? defaultRobotState;
        robots[id] = RobotCommand.make(transfer, commands, robotState);
        return robots[id];
    }

    export function getRobotState(id: number) {
        return robots[id];
    }
}
