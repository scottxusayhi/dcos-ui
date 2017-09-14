# Resource Service

This package wraps connections managed by the `connection-manager` package into an Observable.

## Usage
```javascript
import { request } from "resource-service";

request("http://localhost:4200")
  .retry(3)
  .subscribe(
    value => console.log(value),
    error => console.log(error),
    () => console.log("complete")
  );
```
