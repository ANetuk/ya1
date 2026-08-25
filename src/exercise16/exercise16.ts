class StateMonad<T> {
    private readonly state: T;
    private readonly log: string[];

    constructor(state: T, log: string[]) {
        this.state = state;
        this.log = log;
    }

    getState(this: StateMonad<T>) {
        return this.state;
    }
    
    getLog(this: StateMonad<T>) {
        return this.log;
    }

    bind(this: StateMonad<T>, func: (state: T, log: string[]) => [T, string[]]) {
        const [nextState, nextLog] = func(this.state, this.log);
        return new StateMonad<T>(nextState, nextLog);
    }
}

type WashState = 'water' | 'soap' | 'brush';

interface RobotState {
    x: number;
    y: number;
    angle: number;
    washState: WashState;
}

type MoveResponse = 'moveOk' | 'hitBarrier';

const checkPosition = (x: number, y: number): [number, number, MoveResponse] => {
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));
    if (x === constrainedX || y === constrainedY) {
        return [x, y, 'moveOk'];
    }
    return [x, y, 'hitBarrier'];
};

const move = (distance: number) => (state: RobotState, log: string[]): [RobotState, string[]] => {
    const radians = (state.angle * Math.PI) / 180;
    const x = state.x + distance * Math.cos(radians);
    const y = state.y + distance * Math.sin(radians);

    const [constrainedX, constrainedY] = checkPosition(x, y);

    const nextState = {...state, x: constrainedX, y: constrainedY};
    const message = `POS x=${nextState.x}, y=${nextState.y}`;
    return [nextState, [...log, message]];
}

const turn = (turnAngel: number) => (state: RobotState, log: string[]): [RobotState, string[]] => {
    let angle = (state.angle + turnAngel) % 360;
    if (angle < 0) {
        angle += 360;
    }
    const nextState = {...state, angle};
    return [nextState, [...log, `ANGLE ${nextState.angle}`]];
}

type SetStateResponse = 'stateOk' | 'outOfWater' | 'outOfSoap';

const checkResources = (washState: WashState): SetStateResponse => {
    if (washState === 'water') return 'outOfWater';
    if (washState === 'soap') return 'outOfSoap';
    return 'stateOk';
}

const set = (washState: WashState) => (state: RobotState, log: string[]): [RobotState, string[]] => {
    const checkResponse = checkResources(washState);
    const nextState = checkResponse === 'stateOk' ? {...state, washState} : state;
    const message = `STATE ${nextState.washState}`;
    return [nextState, [...log, message]];
}

const start = () => (state: RobotState, log: string[]): [RobotState, string[]] => {
    const message = `START WITH ${state.washState}`;
    return [state, [...log, message]];
}

const stop = () => (state: RobotState, log: string[]): [RobotState, string[]] => {
    const message = 'STOP';
    return [state, [...log, message]];
}

const initRobotState: RobotState = {angle: 0, washState: 'water', x: 0, y: 0};
const robot = new StateMonad(initRobotState, [])
    .bind(move(100))
    .bind(turn(-90))
    .bind(set('soap'))
    .bind(start())
    .bind(move(50))
    .bind(stop());

console.log(robot.getState(), robot.getLog());
