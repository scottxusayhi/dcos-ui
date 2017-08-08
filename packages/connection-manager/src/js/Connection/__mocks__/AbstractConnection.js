import { INIT } from "../StateConstants";

const AbstractConnection = jest.fn();
AbstractConnection.prototype.open = jest.fn();
AbstractConnection.prototype.close = jest.fn();
AbstractConnection.prototype.reset = jest.fn();
AbstractConnection.prototype.on = jest.fn();
AbstractConnection.prototype.listeners = jest.fn(() => []);
AbstractConnection.prototype.state = INIT;

export default AbstractConnection;

console.log("mocking AbstractConnection");
