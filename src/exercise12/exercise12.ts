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

type Run = (messages: string[]) => {nextMessages: string[], nextState: RobotState.RobotState};

type BoundFunc = (state: RobotState.RobotState) => Robot;

class Robot {
    public run: Run;

    constructor(run: Run) {
        this.run = run;
    }

    public bind(boundFunc: BoundFunc) {
        return new Robot(messages => {
            const {nextMessages, nextState} = this.run(messages);
            const nextRobot = boundFunc(nextState);
            return nextRobot.run(nextMessages);
        });
    }
}

const initRobotState: RobotState.RobotState = {
    angle: 0,
    washState: 'water',
    x: 0,
    y: 0
};
const robot = new Robot((messages) => ({nextMessages: messages, nextState: initRobotState}))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.move(100, robotState);
        return {nextState, nextMessages: [...messages, message]};
    }))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.turn(-90, robotState);
        return {nextState, nextMessages: [...messages, message]};
    }))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.set('soap', robotState);
        return {nextState, nextMessages: [...messages, message]};
    }))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.start(robotState);
        return {nextState, nextMessages: [...messages, message]};
    }))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.move(50, robotState);
        return {nextState, nextMessages: [...messages, message]};
    }))
    .bind(robotState => new Robot(messages => {
        const {nextState, message} = RobotState.stop(robotState);
        return {nextState, nextMessages: [...messages, message]};
    }));
const {nextMessages, nextState} = robot.run([]);
console.log(nextMessages, nextState);
