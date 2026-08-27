type WashState = 'water' | 'soap' | 'brush';

interface RobotState {
    x: number;
    y: number;
    angle: number;
    washState: WashState;
}

type ResultCode = 'ok' | 'problem';

interface MoveResponse {
    code: ResultCode;
    x: number;
    y: number;
}

interface TurnResponse {
    code: ResultCode;
    angle: number;
}

interface SetStateResponse {
    code: ResultCode;
    state: WashState;
}

interface Command<CommandResponse = any> {
    interpret: (robotState: RobotState, log: string[]) => [CommandResponse, RobotState, string[]];
    next: (commandResponse: CommandResponse) => Command | undefined;
}

class StartCommand implements Command<undefined> {
    next: (_: undefined) => Command;

    constructor(nextCommand: (_: undefined) => Command) {
        this.next = nextCommand;
    }

    public interpret(this: StartCommand, robotState: RobotState, log: string[]): [undefined, RobotState, string[]] {
        return [undefined, robotState, [...log, `START WITH ${robotState.washState}`]];
    }
}

class MoveCommand implements Command<MoveResponse> {
    next: (response: MoveResponse) => Command;
    distance: number;

    constructor(distance: number, next: (response: MoveResponse) => Command) {
        this.next = next;
        this.distance = distance;
    }

    private validateCommand(this: MoveCommand, robotState: RobotState): MoveResponse {
        const radians = (robotState.angle * Math.PI) / 180;
        const x = robotState.x + this.distance * Math.cos(radians);
        const y = robotState.y + this.distance * Math.sin(radians);

        const constrainedX = Math.max(0, Math.min(100, x));
        const constrainedY = Math.max(0, Math.min(100, y));
        if (x === constrainedX || y === constrainedY) {
            return {x, y, code: 'ok'};
        }

        return {x, y, code: 'problem'};
    }

    public interpret(this: MoveCommand, robotState: RobotState, log: string[]): [MoveResponse, RobotState, string[]] {
        const validationResponse = this.validateCommand(robotState);
        const nextState = {...robotState, x: validationResponse.x, y: validationResponse.y};
        const message = `POS x=${nextState.x}, y=${nextState.y}`;
        return [validationResponse, robotState, [...log, message]];
    }
}

class TurnCommand implements Command<TurnResponse> {
    next: (response: TurnResponse) => Command;
    turnAngle: number;

    constructor(turnAngle: number, next: (response: TurnResponse) => Command) {
        this.next = next;
        this.turnAngle = turnAngle;
    }

    interpret(this: TurnCommand, robotState: RobotState, log: string[]): [TurnResponse, RobotState, string[]] {
        let angle = (robotState.angle + this.turnAngle) % 360;
        if (angle < 0) {
            angle += 360;
        }
        const nextState = {...robotState, angle};
        return [{angle, code: 'ok'}, nextState, [...log, `ANGLE ${nextState.angle}`]];
    }
}

class SetStateCommand implements Command<SetStateResponse> {
    next: (response: SetStateResponse) => Command;
    state: WashState;

    constructor(state: WashState, next: (response: SetStateResponse) => Command) {
        this.next = next;
        this.state = state;
    }

    private validateCommand(this: SetStateCommand, robotState: RobotState): SetStateResponse {
        return this.state === 'brush' ? {code: 'ok', state: 'brush'} : {code: 'problem', state: robotState.washState};
    }

    interpret(this: SetStateCommand, robotState: RobotState, log: string[]): [SetStateResponse, RobotState, string[]] {
        const validationResponse = this.validateCommand(robotState);
        const message = `STATE ${validationResponse.state}`;
        const nextState = {...robotState, washState: validationResponse.state};
        return [validationResponse, nextState, [...log, message]];
    }
}

class StopCommand implements Command<undefined> {
    next = () => undefined;

    public interpret(this: StartCommand, robotState: RobotState, log: string[]): [undefined, RobotState, string[]] {
        return [undefined, robotState, [...log, `STOP`]];
    }
}

const commandHead: Command = new StartCommand(
    () => new MoveCommand(100,
        () => new TurnCommand(-90,
            () => new SetStateCommand('soap',
                () => new MoveCommand(50,
                    () => new StopCommand()
                )
            )
        )
    )
);

let robotState: RobotState = {angle: 0, washState: 'water', x: 0, y: 0};
let log: string[] = [];
let command: Command | undefined = commandHead;
while (command) {
    const [response, nextRobotState, nextLog] = command.interpret(robotState, log);
    robotState = nextRobotState;
    log = nextLog;
    command = command.next(response);
}

console.log(robotState, log);
