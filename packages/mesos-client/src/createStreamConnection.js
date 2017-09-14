import Rx from "rxjs";
import { request } from "resource-service";
import extractRecords from "./recordio-extensions/extractRecords";

export default function createStreamConnection(body, baseUrl = "") {
  return request(`${baseUrl}/mesos/api/v1`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
    .scan(extractRecords, {})
    .map(({ records }) => Rx.Observable.from(records))
    .concatAll()
    .publishReplay()
    .refCount();
}
