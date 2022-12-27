// Minimalistic pub/sub for state exposed

export type TPubSubEvent<TEventName> = {
  name: TEventName;
  value: any;
};
type TPubSubscriper<TEventName extends string> = (
  event: TPubSubEvent<TEventName>
) => void;
export class PubSub<TEventName extends string = string> {
  _subscribers: TPubSubscriper<any>[];
  _state: Record<TEventName, any>;

  constructor(initialEvent?: TPubSubEvent<TEventName>) {
    this._subscribers = [];

    if (!initialEvent) {
      this._state = {} as any;
      return;
    }

    const { name, value } = initialEvent;
    this._state = { [name]: value } as any;
  }

  subscribe(cb: TPubSubscriper<TEventName>) {
    this._subscribers.push(cb);
  }

  unsubscribe(cb: TPubSubscriper<TEventName>) {
    this._subscribers = this._subscribers.filter((fn) => fn !== cb);
  }

  send(event: TPubSubEvent<TEventName>) {
    this._state[event.name] = event.value;
    for (const cb of this._subscribers) {
      try {
        cb(event);
      } catch (e) {
        // TODO: Remove me?
      }
    }
  }

  state(name: TEventName) {
    return this._state[name];
  }
}
