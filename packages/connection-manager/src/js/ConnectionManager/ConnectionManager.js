import { List } from "immutable";
// import { AuthStore } from "authenticator";
import ConnectionQueue from "../ConnectionQueue/ConnectionQueue.js";
import { INIT, STARTED } from "../Connection/StateConstants";

/**
 * The Connection Manager which is responsible for
 * queuing Connections into the ConnectionQueue and
 * actually starting them, when they are head of
 * waiting line.
 */
export default class ConnectionManager {
  /**
   * Initializes an Instance of ConnectionManager
   * @param {Integer} maxConnections – max open connections
   */
  constructor(maxConnections = 6) {
    Object.defineProperty(this, "maxConnections", {
      get() {
        return maxConnections;
      }
    });

    let waiting = new ConnectionQueue();
    Object.defineProperty(this, "waiting", {
      get() {
        return waiting;
      },
      set(_waiting) {
        waiting = _waiting;
      }
    });

    let open = List();
    Object.defineProperty(this, "open", {
      get() {
        return open;
      },
      set(_open) {
        open = _open;
      }
    });

    this.handleConnectionClose = this.handleConnectionClose.bind(this);
  }

  /**
   * Queues given connection with given priority
   * @param {AbstractConnection} connection – connection to queue
   * @param {Integer} [priority=0] – optional change of priority, will be updated inside connection
   */
  queue(connection, priority = 0) {
    if (
      (connection.state === INIT || connection.state === STARTED) &&
      !connection.listeners("close").includes(this.handleConnectionClose)
    ) {
      connection.on("close", this.handleConnectionClose);
    }
    switch (connection.state) {
      case INIT:
        this.waiting = this.waiting.enqueue(connection, priority);
        break;
      case STARTED:
        this.open = this.open.add(connection);
        break;
    }

    this.next();
  }
  /**
   * handles all queue activity events
   * @param {AbstractConnection} connection
   * @return {void}
   */
  next() {
    if (this.open.size >= this.maxConnections || this.waiting.size === 0) {
      return;
    }

    const connection = this.waiting.head();
    this.waiting = this.waiting.tail();

    if (connection.state === INIT) {
      connection.open(); // AuthStore.getTokenForURL(connection.url)
    }

    if (connection.state === STARTED) {
      this.open = this.open.push(connection);
    }
    this.waiting = this.waiting.tail();

    this.next();
  }
  /**
   * handles connection events, removes connection from store
   * @param {AbstractConnection} connection – connection which fired the event
   * @return {void}
   */
  handleConnectionClose(connection) {
    this.open = this.open.delete(connection);
    this.next();
  }
}
