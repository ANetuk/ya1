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

interface FullState {
    robotState: RobotState.RobotState;
    messages: string[];
}

const startState: FullState = {
    robotState: {
        angle: 0,
        washState: 'water',
        x: 0,
        y: 0
    },
    messages: []
};

const executedCommands: Command[] = [];

const applyCommand = (
    {robotState, messages}: FullState,
    command: Command
) => {
    if (command.name === 'move') {
        const {nextState, message} = RobotState.move(command.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (command.name === 'turn') {
        const {nextState, message} = RobotState.turn(command.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (command.name === 'set') {
        const {nextState, message} = RobotState.set(command.payload, robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (command.name === 'start') {
        const {nextState, message} = RobotState.start(robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    if (command.name === 'stop') {
        const {nextState, message} = RobotState.stop(robotState);
        return {robotState: nextState, messages: [...messages, message]};
    }
    return {robotState, messages};
}

const getCurrentFullState = () => executedCommands.reduce(applyCommand, startState);

const shouldHandleCommand = (_fullState: FullState, _command: Command) => true;

const handleCommand = (command: Command) => {
    const fullState = getCurrentFullState();
    if (shouldHandleCommand(fullState, command)) {
        executedCommands.push(command);
    }
};

[
    {name: 'move' as const, payload: 100},
    {name: 'turn' as const, payload: -90},
    {name: 'set' as const, payload: 'soap' as const},
    {name: 'start' as const},
    {name: 'move' as const, payload: 50},
    {name: 'stop' as const}
].forEach(handleCommand);
