export type WashState = 'water' | 'soap' | 'brush';

export class RobotState {
    private _x: number = 0;
    public get x() {
        return this._x;
    }

    private _y: number = 0;
    public get y() {
        return this._y;
    }

    private _angle: number = 0;
    public get angle() {
        return this._angle;
    }

    private _washState: WashState = 'water';
    public get washState() {
        return this._washState;
    }

    public move(this: RobotState, distance: number) {
        const radians = (this.angle * Math.PI) / 180;
        this._x += distance * Math.cos(radians);
        this._y += distance * Math.sin(radians);
    }

    public turn(this: RobotState, turnAngel: number) {
        this._angle = (this._angle + turnAngel) % 360;
        if (this._angle < 0) {
            this._angle += 360;
        }
    }

    public set(this: RobotState, washState: WashState) {
        this._washState = washState;
    }
}
