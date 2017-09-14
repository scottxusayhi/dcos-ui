# Apache Mesos Client

This package provides a nice way of connecting to the Mesos Event Stream API.

## Usage
```javascript
import { createEventStreamConnection } from "mesos-client";

createStreamConnection({ type: "SUBSCRIBE" }).subscribe(
  value => {
    try {
      console.log(JSON.parse(value));
    } catch (error) {
      console.log(error);
    }
  },
  error => console.log(error),
  () => console.log("complete")
);
```

`createObservableConnection` opens a persistent connection to [Mesos HTTP Operator Api](http://mesos.apache.org/documentation/latest/operator-http-api) Event Stream and returns `rxjs` `ReplaySubject` Observable.