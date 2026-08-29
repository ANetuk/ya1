export type WashState = 'water' | 'soap' | 'brush';

export interface RobotState {
    x: number;
    y: number;
    angle: number;
    washState: WashState;
}

interface ActionResult {
    nextState: RobotState;
    message: string;
}

interface RobotImplementation {
    move: (distance: number, state: RobotState) => ActionResult;
    turn: (turnAngle: number, state: RobotState) => ActionResult;
    set: (washState: WashState, state: RobotState) => ActionResult;
    start: (state: RobotState) => ActionResult;
    stop: (state: RobotState) => ActionResult;
}

const robotImplementation: RobotImplementation = {
    move(distance: number, state: RobotState) {
        const radians = (state.angle * Math.PI) / 180;
        const x = state.x + distance * Math.cos(radians);
        const y = state.y + distance * Math.sin(radians);
        const nextState = {...state, x, y}
        const message = `POS x=${nextState.x}, y=${nextState.y}`;
        return {nextState, message};
    },
    turn(turnAngle: number, state: RobotState) {
        let angle = (state.angle + turnAngle) % 360;
        if (angle < 0) {
            angle += 360;
        }
        const nextState = {...state, angle};
        const message = `ANGLE ${nextState.angle}`;
        return {nextState, message};
    },
    set(washState: WashState, state: RobotState) {
        const nextState = {...state, washState};
        const message = `STATE ${nextState.washState}`;
        return {nextState, message};
    },
    start(state: RobotState) {
        const message = `START WITH ${state.washState}`;
        return {nextState: state, message};
    },
    stop(state: RobotState) {
        const message = 'STOP';
        return {nextState: state, message};
    }
}

class RobotApi {
    private robotImplementation: RobotImplementation = robotImplementation;

    private robotState: RobotState = {angle: 0, washState: 'water', x: 0, y: 0};
    private log: string[] = [];

    public getRobotState(this: RobotApi) {
        return this.robotState;
    }

    public getLog(this: RobotApi) {
        return this.log;
    }

    private updateByActionResult(
        this: RobotApi,
        {nextState, message}: {nextState: RobotState; message: string;}
    ) {
        this.robotState = nextState;
        this.log.push(message);
    }

    public move(distance: number) {
        this.updateByActionResult(this.robotImplementation.move(distance, this.robotState));
        return this;
    }

    public turn(turnAngle: number) {
        this.updateByActionResult(this.robotImplementation.turn(turnAngle, this.robotState));
        return this;
    }

    public set(washState: WashState) {
        this.updateByActionResult(this.robotImplementation.set(washState, this.robotState));
        return this;
    }

    public start() {
        this.updateByActionResult(this.robotImplementation.start(this.robotState));
        return this;
    }

    public stop() {
        this.updateByActionResult(this.robotImplementation.stop(this.robotState));
        return this;
    }
}

const robot = new RobotApi();
robot.move(100).turn(-90).set('soap').start().move(50).stop();
console.log(robot.getRobotState(), robot.getLog());
