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

const initRobotState: RobotState.RobotState = {
    angle: 0,
    washState: 'water',
    x: 0,
    y: 0
};
const stack: unknown[] = [initRobotState];

const transfer = console.log;

const commandsString = '100 move -90 turn soap set start 50 move stop';
const commands = commandsString.split(' ');

commands.forEach(command => {
    if (command === 'move') {
        const distance = Number(stack.pop());
        const robotState = stack.pop() as RobotState.RobotState;
        const nextRobotState = RobotState.move(transfer, distance, robotState)
        stack.push(nextRobotState);
    } else if (command === 'turn') {
        const angle = Number(stack.pop());
        const robotState = stack.pop() as RobotState.RobotState;
        const nextRobotState = RobotState.turn(transfer, angle, robotState);
        stack.push(nextRobotState);
    } else if (command === 'set') {
        const washState = stack.pop() as RobotState.WashState;
        const robotState = stack.pop() as RobotState.RobotState;
        const nextRobotState = RobotState.set(transfer, washState, robotState);
        stack.push(nextRobotState);
    } else if (command === 'start') {
        const robotState = stack.pop() as RobotState.RobotState;
        const nextRobotState = RobotState.start(transfer, robotState);
        stack.push(nextRobotState);
    } else if (command === 'stop') {
        const robotState = stack.pop() as RobotState.RobotState;
        const nextRobotState = RobotState.stop(transfer, robotState);
        stack.push(nextRobotState);
    } else {
        stack.push(command);
    }
});
