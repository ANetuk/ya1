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

namespace RobotApi {
    const defaultRobotState: RobotState.RobotState = {x: 0, y: 0, angle: 0, washState: 'water'};
    const transfer = console.log;
    const robots: Record<number, RobotState.RobotState | undefined> = {};

    function move(distance: number, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.move(distance, robotState);
        transfer(`POS x=${nextRobotState.x}, y=${nextRobotState.y}`);
        return nextRobotState;
    }

    function turn(angle: number, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.turn(angle, robotState);
        transfer(`ANGLE ${nextRobotState.angle}`);
        return nextRobotState;
    }

    function set(washState: RobotState.WashState, robotState: RobotState.RobotState) {
        const nextRobotState = RobotState.set(washState, robotState);
        transfer(`STATE ${nextRobotState.washState}`);
        return nextRobotState;
    }

    function start(robotState: RobotState.RobotState) {
        transfer(`START WITH ${robotState.washState}`);
        return robotState;
    }

    function stop(robotState: RobotState.RobotState) {
        transfer('STOP');
        return robotState;
    }

    export function make(id: number, commands: string[]) {
        const robotState = robots[id] ?? defaultRobotState;
        robots[id] = commands.map(command => {
            const words = command.split(' ');
            const [commandName, param] = words;
            if (commandName === 'move') {
                return (robotState: RobotState.RobotState) => move(Number(param), robotState)
            }
            if (commandName === 'turn') {
                return (robotState: RobotState.RobotState) => turn(Number(param), robotState)
            }
            if (commandName === 'set') {
                return (robotState: RobotState.RobotState) => set(param as RobotState.WashState, robotState)
            }
            if (commandName === 'stop') {
                return (robotState: RobotState.RobotState) => stop(robotState)
            }
            if (commandName === 'start') {
                return (robotState: RobotState.RobotState) => start(robotState)
            }
            return (robotState: RobotState.RobotState) => robotState;
        }).reduce(
            (robotState: RobotState.RobotState, command) => command(robotState),
            robotState
        )
        return robots[id];
    }

    export function getRobotState(id: number) {
        return robots[id];
    }
}
