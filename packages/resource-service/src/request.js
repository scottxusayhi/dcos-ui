import ConnectionManager, {
  EventTypes,
  XHRConnection
} from "connection-manager";
import Rx from "rxjs";

export default function request(url, options) {
  return Rx.Observable.create(function(observer) {
    const connection = new XHRConnection(url, options);

    connection.addListener(EventTypes.PROGRESS, function(target) {
      observer.next(target.response);
    });
    connection.addListener(EventTypes.ERROR, function(error) {
      observer.error(error);
    });
    connection.addListener(EventTypes.CLOSE, function() {
      observer.complete();
    });

    ConnectionManager.queue(connection);

    // Closing the connection when there are no subscribers left
    return function teardown() {
      connection.close();
    };
  });
}
