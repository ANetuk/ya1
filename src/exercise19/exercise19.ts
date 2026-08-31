class StateMonad<
    RobotState,
    Functions
> {
    private readonly functions: Functions;
    private readonly state: RobotState;
    private readonly log: string[];

    constructor(functions: Functions, state: RobotState, log: string[]) {
        this.functions = functions;
        this.state = state;
        this.log = log;
    }

    getState(this: StateMonad<RobotState, Functions>) {
        return this.state;
    }
    
    getLog(this: StateMonad<RobotState, Functions>) {
        return this.log;
    }

    bind(
        this: StateMonad<RobotState, Functions>,
        func: (currentFunctions: Functions) => ((
            functions: Functions, state: RobotState, log: string[]
        ) => [Functions, RobotState, string[]]) | undefined
    ) {
        const nextFunction = func(this.functions);

        if (!nextFunction) return this;

        const [functions, nextState, nextLog] = nextFunction(this.functions, this.state, this.log);
        return new StateMonad<RobotState, Functions>(functions, nextState, nextLog);
    }
}

const omit = <T extends object>(obj: T, omitKey: string) => (
    Object.entries(obj)
        .filter(([key]) => key !== omitKey)
        .reduce((acc, [key, value]) => ({...acc, [key]: value}), {}) as T
);

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

const move = (distance: number) => (
    functions: RobotFunctions, state: RobotState, log: string[]
): [RobotFunctions, RobotState, string[]] => {
    const radians = (state.angle * Math.PI) / 180;
    const x = state.x + distance * Math.cos(radians);
    const y = state.y + distance * Math.sin(radians);

    const [constrainedX, constrainedY, checkPositionResult] = checkPosition(x, y);

    const nextState = {...state, x: constrainedX, y: constrainedY};

    if (checkPositionResult === 'moveOk') {
        const message = `POS x=${nextState.x}, y=${nextState.y}`;
        return [functions, nextState, [...log, message]];
    }

    const message = `HIT_BARRIER at x=${nextState.x}, y=${nextState.y}`;
    return [omit(functions, 'move'), nextState, [...log, message]];
}

const turn = (turnAngel: number) => (
    functions: RobotFunctions, state: RobotState, log: string[]
): [RobotFunctions, RobotState, string[]] => {
    let angle = (state.angle + turnAngel) % 360;
    if (angle < 0) {
        angle += 360;
    }
    const nextState = {...state, angle};
    return [functions, nextState, [...log, `ANGLE ${nextState.angle}`]];
}

type SetStateResponse = 'stateOk' | 'outOfWater' | 'outOfSoap';

const checkResources = (washState: WashState): SetStateResponse => {
    if (washState === 'water') return 'outOfWater';
    if (washState === 'soap') return 'outOfSoap';
    return 'stateOk';
}

const set = (washState: WashState) => (
    functions: RobotFunctions, state: RobotState, log: string[]
): [RobotFunctions, RobotState, string[]] => {
    const checkResult = checkResources(washState);

    if (checkResult !== 'stateOk') {
        const nextState = {...state, washState};
        const message = `RESOURCE ERROR: ${checkResult} for mode ${washState}`;
        return [omit(functions, 'set'), nextState, [...log, message]];
    }

    const nextState = {...state, washState};
    const message = `STATE ${nextState.washState}`;
    return [functions, nextState, [...log, message]];
}

const start = () => (
    functions: RobotFunctions, state: RobotState, log: string[]
): [RobotFunctions, RobotState, string[]] => {
    const message = `START WITH ${state.washState}`;
    return [functions, state, [...log, message]];
}

const stop = () => (
    functions: RobotFunctions, state: RobotState, log: string[]
): [RobotFunctions, RobotState, string[]] => {
    const message = 'STOP';
    return [functions, state, [...log, message]];
}

interface RobotFunctions {
    move?: (distance: number) => (
        functions: RobotFunctions, state: RobotState, log: string[]
    ) => [RobotFunctions, RobotState, string[]];
    turn?: (turnAngel: number) => (
        functions: RobotFunctions, state: RobotState, log: string[]
    ) => [RobotFunctions, RobotState, string[]];
    set?: (washState: WashState) => (
        functions: RobotFunctions, state: RobotState, log: string[]
    ) => [RobotFunctions, RobotState, string[]];
    start?: () => (
        functions: RobotFunctions, state: RobotState, log: string[]
    ) => [RobotFunctions, RobotState, string[]];
    stop?: () => (
        functions: RobotFunctions, state: RobotState, log: string[]
    ) => [RobotFunctions, RobotState, string[]];
}

const initFunctions: RobotFunctions = {move, turn, set, start, stop};
const initRobotState: RobotState = {angle: 0, washState: 'water', x: 0, y: 0};
const robot = new StateMonad(initFunctions, initRobotState, [])
    .bind(functions => functions.move?.(90))
    .bind(functions => functions.turn?.(-90))
    .bind(functions => functions.set?.('soap'))
    .bind(functions => functions.start?.())
    .bind(functions => functions.move?.(50))
    .bind(functions => functions.stop?.());

console.log(robot.getState(), robot.getLog());
