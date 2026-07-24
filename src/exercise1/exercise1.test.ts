import {RobotState} from './exercise1';

describe('RobotState', () => {
    it('moves right when angle = 0', () => {
        const robotState = new RobotState();
        robotState.move(1);
        expect(robotState.x).toBeCloseTo(1);
        expect(robotState.y).toBeCloseTo(0);
    });
    it('moves right when angle = 45', () => {
        const robotState = new RobotState();
        robotState.turn(45);
        robotState.move(1);
        expect(robotState.x).toBeCloseTo(0.71);
        expect(robotState.y).toBeCloseTo(0.71);
    });
    it('moves right when angle = 90', () => {
        const robotState = new RobotState();
        robotState.turn(90);
        robotState.move(1);
        expect(robotState.x).toBeCloseTo(0);
        expect(robotState.y).toBeCloseTo(1);
    });
    it('moves right when angle = 120', () => {
        const robotState = new RobotState();
        robotState.turn(120);
        robotState.move(1);
        expect(robotState.x).toBeCloseTo(-0.5);
        expect(robotState.y).toBeCloseTo(0.87);
    });
    it('normalizes angle when turn by 390', () => {
        const robotState = new RobotState();
        robotState.turn(390);
        expect(robotState.angle).toEqual(30);
    });
    it('normalizes angle when turn by -370', () => {
        const robotState = new RobotState();
        robotState.turn(-370);
        expect(robotState.angle).toEqual(350);
    });
    it('normalizes angle when turn by 720', () => {
        const robotState = new RobotState();
        robotState.turn(720);
        expect(robotState.angle).toEqual(0);
    });
});
