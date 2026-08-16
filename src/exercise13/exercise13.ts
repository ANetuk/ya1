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
        const nextState = {...state, x, y}
        const message = `POS x=${nextState.x}, y=${nextState.y}`;
        return {nextState, message};
    }

    export function turn(turnAngel: number, state: RobotState) {
        let angle = (state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        const nextState = {...state, angle};
        const message = `ANGLE ${nextState.angle}`;
        return {nextState, message};
    }

    export function set(washState: WashState, state: RobotState) {
        const nextState = {...state, washState};
        const message = `STATE ${nextState.washState}`;
        return {nextState, message};
    }

    export function start(state: RobotState) {
        const message = `START WITH ${state.washState}`;
        return {nextState: state, message};
    }

    export function stop(state: RobotState) {
        const message = 'STOP';
        return {nextState: state, message};
    }
}

type Command =
    | {name: 'move'; payload: number;}
    | {name: 'turn'; payload: number;}
    | {name: 'set'; payload: RobotState.WashState;}
    | {name: 'start';}
    | {name: 'stop';};

const commandStrings = [
    'move 100',
    'turn -90',
    'set soap',
    'start',
    'move 50',
    'stop'
];
const commands = commandStrings.map((c): Command | undefined => {
    const [name, payload] = c.split(' ');
    if (name === 'move') return {name: 'move' as const, payload: Number(payload)};
    if (name === 'turn') return {name: 'turn' as const, payload: Number(payload)};
    if (name === 'set') return {name: 'set' as const, payload: payload as RobotState.WashState};
    if (name === 'start') return {name: 'start' as const};
    if (name === 'stop') return {name: 'stop' as const};
    return undefined;
}).filter((c: Command | undefined): c is Command => Boolean(c));
const initRobotState: RobotState.RobotState = {
    angle: 0,
    washState: 'water',
    x: 0,
    y: 0
};
const initMessages: string[] = [];
const {robotState, messages} = commands.reduce(({robotState, messages}, c) => {
    if (c.name === 'move') {
        const {nextState, message} = RobotState.move(c.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (c.name === 'turn') {
        const {nextState, message} = RobotState.turn(c.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (c.name === 'set') {
        const {nextState, message} = RobotState.set(c.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (c.name === 'start') {
        const {nextState, message} = RobotState.start(robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (c.name === 'stop') {
        const {nextState, message} = RobotState.stop(robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    return {robotState, messages};
}, {robotState: initRobotState, messages: initMessages})
console.log(robotState, messages);
