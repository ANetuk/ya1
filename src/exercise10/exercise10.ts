namespace RobotState {
    export type WashState = 'water' | 'soap' | 'brush';

    export interface RobotState {
        x: number;
        y: number;
        angle: number;
        washState: WashState;
    }

    export type Transfer = (message: string) => void;

    function move(transfer: Transfer, distance: number, state: RobotState) {
        const radians = (state.angle * Math.PI) / 180;
        const x = state.x + distance * Math.cos(radians);
        const y = state.y + distance * Math.sin(radians);
        const nextState = {...state, x, y}
        transfer(`POS x=${nextState.x}, y=${nextState.y}`);
        return nextState;
    }

    function turn(transfer: Transfer, turnAngel: number, state: RobotState) {
        let angle = (state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        const nextState = {...state, angle};
        transfer(`ANGLE ${nextState.angle}`);
        return nextState;
    }

    function set(transfer: Transfer, washState: WashState, state: RobotState) {
        const nextState = {...state, washState};
        transfer(`STATE ${nextState.washState}`);
        return nextState;
    }

    function start(transfer: Transfer, state: RobotState) {
        transfer(`START WITH ${state.washState}`);
        return state;
    }

    function stop(transfer: Transfer, state: RobotState) {
        transfer('STOP');
        return state;
    }

    export type Action =
        | {state: RobotState; transfer: Transfer; type: 'move'; payload: number;}
        | {state: RobotState; transfer: Transfer; type: 'turn'; payload: number;}
        | {state: RobotState; transfer: Transfer; type: 'set'; payload: WashState;}
        | {state: RobotState; transfer: Transfer; type: 'start';}
        | {state: RobotState; transfer: Transfer; type: 'stop';};

    export type Send = (action: Action) => RobotState;

    export function send(action: Action) {
        const {state, type, transfer} = action;
        if (type === 'move') return move(transfer, action.payload, state);
        if (type === 'turn') return turn(transfer, action.payload, state);
        if (type === 'set') return set(transfer, action.payload, state);
        if (type === 'start') return start(transfer, state);
        if (type === 'stop') return stop(transfer, state)
        return state;
    }
}

class RobotApi {
    private robotState: RobotState.RobotState = {x: 0, y: 0, angle: 0, washState: 'water'};
    private send: RobotState.Send = (action) => action.state;
    private transfer = console.log;

    public setup(
        this: RobotApi,
        send: RobotState.Send,
        transfer: (message: string) => void
    ) {
        this.send = send;
        this.transfer = transfer;
    }

    public make(commands: string[]) {
        this.robotState = commands.map(command => {
            return (robotState: RobotState.RobotState) => {
                const words = command.split(' ');
                const [commandName, param] = words;
                let action: RobotState.Action | undefined;
                if (commandName === 'move') {
                    action = {
                        type: 'move',
                        transfer: this.transfer,
                        state: robotState,
                        payload: Number(param)
                    };
                } else if (commandName === 'turn') {
                    action = {
                        type: 'turn',
                        transfer: this.transfer,
                        state: robotState,
                        payload: Number(param)
                    };
                } else if (commandName === 'set') {
                    action = {
                        type: 'set',
                        transfer: this.transfer,
                        state: robotState,
                        payload: param as RobotState.WashState
                    }
                } else if (commandName === 'start') {
                    action = {
                        type: 'start',
                        transfer: this.transfer,
                        state: robotState
                    }
                } else if (commandName === 'stop') {
                    action = {
                        type: 'stop',
                        transfer: this.transfer,
                        state: robotState
                    }
                }
                if (!action) return robotState;
                return this.send(action);
            };
        }).reduce(
            (robotState: RobotState.RobotState, command) => command(robotState),
            this.robotState
        )
    }
}

const robot = new RobotApi();
robot.setup(RobotState.send, console.log);

robot.make([
    'move 100',
    'turn -90',
    'set soap',
    'start',
    'move 50',
    'stop'
]);
