type WashState = 'water' | 'soap' | 'brush';

interface RobotState {
    x: number;
    y: number;
    angle: number;
    washState: WashState;
}

type Event =
    | {name: 'moveRequestedEvent'; payload: number;}
    | {name: 'robotMovedEvent'; payload: RobotState;}
    | {name: 'turnRequestedEvent'; payload: number;}
    | {name: 'robotTurnedEvent'; payload: RobotState;}
    | {name: 'setRequestedEvent'; payload: WashState;}
    | {name: 'robotSetEvent'; payload: RobotState;}
    | {name: 'startRequestedEvent';}
    | {name: 'robotStartedEvent'; payload: RobotState;}
    | {name: 'stopRequestedEvent';}
    | {name: 'robotStoppedEvent'; payload: RobotState;};

class EventStore {
    private callbacks: ((event: Event) => void)[] = [];

    public send(this: EventStore, event: Event) {
        this.callbacks.forEach(callback => {
            callback(event)
        });
    }

    public subscribe(this: EventStore, callback: (event: Event) => void) {
        this.callbacks.push(callback);
    }
}

type Command =
    | {name: 'move'; payload: number;}
    | {name: 'turn'; payload: number;}
    | {name: 'set'; payload: WashState;}
    | {name: 'start';}
    | {name: 'stop';};

class CommandHandler {
    private eventStore: EventStore;

    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
    }

    public handle(command: Command) {
        if (command.name === 'move') {
            this.eventStore.send({name: 'moveRequestedEvent', payload: command.payload});
        } else if (command.name === 'turn') {
            this.eventStore.send({name: 'turnRequestedEvent', payload: command.payload});
        } else if (command.name === 'set') {
            this.eventStore.send({name: 'setRequestedEvent', payload: command.payload});
        } else if (command.name === 'start') {
            this.eventStore.send({name: 'startRequestedEvent'});
        } else if (command.name === 'stop') {
            this.eventStore.send({name: 'stopRequestedEvent'});
        }
    }
}

class StateProcessor {
    private state: RobotState;
    private events: Event[];
    private eventStore: EventStore;

    constructor(eventStore: EventStore) {
        this.state = {angle: 0, washState: 'water', x: 0, y: 0};
        this.events = [];

        this.eventStore = eventStore;
        this.eventStore.subscribe((event) => {
            this.events.push(event);
        });

        setInterval(() => {
            this.processEvent()
        }, 200);
    }

    private processMove(distance: number) {
        const radians = (this.state.angle * Math.PI) / 180;
        const x = this.state.x + distance * Math.cos(radians);
        const y = this.state.y + distance * Math.sin(radians);
        return {...this.state, x, y};
    }

    private processTurn(turnAngel: number) {
        let angle = (this.state.angle + turnAngel) % 360;
        if (angle < 0) {
            angle += 360;
        }
        return {...this.state, angle};
    }

    private processSet(washState: WashState) {
        return {...this.state, washState};
    }

    private processEvent(this: StateProcessor) {
        const event = this.events.shift();
        if (event?.name === 'moveRequestedEvent') {
            this.state = this.processMove(event.payload);
            this.eventStore.send({name: 'robotMovedEvent', payload: this.state});
        } else if (event?.name === 'turnRequestedEvent') {
            this.state = this.processTurn(event.payload);
            this.eventStore.send({name: 'robotTurnedEvent', payload: this.state});
        } else if (event?.name === 'setRequestedEvent') {
            this.state = this.processSet(event.payload);
            this.eventStore.send({name: 'robotSetEvent', payload: this.state});
        } else if (event?.name === 'startRequestedEvent') {
            this.eventStore.send({name: 'robotStartedEvent', payload: this.state});
        } else if (event?.name === 'stopRequestedEvent') {
            this.eventStore.send({name: 'robotStoppedEvent', payload: this.state});
        }
    }

    public getState(this: StateProcessor) {
        return this.state;
    }
}

class MessagesProcessor {
    private state: string[];
    private events: Event[];
    private eventStore: EventStore;

    constructor(eventStore: EventStore) {
        this.state = [];
        this.events = [];

        this.eventStore = eventStore;
        this.eventStore.subscribe((event) => {
            this.events.push(event);
        });

        setInterval(() => {
            this.processEvent();
        }, 200);
    }

    private processEvent(this: MessagesProcessor) {
        const event = this.events.shift();
        if (event?.name === 'robotMovedEvent') {
            this.state.push(`POS x=${event.payload.x}, y=${event.payload.y}`);
        } else if (event?.name === 'robotTurnedEvent') {
            this.state.push(`ANGLE ${event.payload.angle}`);
        } else if (event?.name === 'robotSetEvent') {
            this.state.push(`STATE ${event.payload.washState}`);
        } else if (event?.name === 'robotStartedEvent') {
            this.state.push(`START WITH ${event.payload.washState}`);
        } else if (event?.name === 'robotStoppedEvent') {
            this.state.push('STOP');
        }
    }

    public getState(this: MessagesProcessor) {
        return this.state;
    }
}

const eventStore = new EventStore();
const commandHandler = new CommandHandler(eventStore);
const stateProcessor = new StateProcessor(eventStore);
const messagesProcessor = new MessagesProcessor(eventStore);

[
    {name: 'move' as const, payload: 100},
    {name: 'turn' as const, payload: -90},
    {name: 'set' as const, payload: 'soap' as const},
    {name: 'start' as const},
    {name: 'move' as const, payload: 50},
    {name: 'stop' as const}
].forEach(c => {
    commandHandler.handle(c)
});
setTimeout(() => {
    console.log(stateProcessor.getState());
    console.log(messagesProcessor.getState());
}, 3000);
