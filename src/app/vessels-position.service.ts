import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { webSocket } from 'rxjs/webSocket';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError } from 'rxjs/operators';
export const WS_ENDPOINT = environment.wsEndpoint;
export const RECONNECT_INTERVAL = environment.reconnectInterval;

@Injectable({
  providedIn: 'root'
})
export class VesselsPositionService {

  private socket$;
  public proxy$ = new Subject();

  constructor() {

  }

  /**
   * Creates a new WebSocket subject and send it to the messages subject
   * @param reconnect If true the observable will be retried.
   */
  public connect(reconnect : boolean = false) : void {

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();
      this.socket$.pipe(
                        reconnect ? this.reconnect : o => o,
                  )
                  .subscribe(
                    message => this.proxy$.next(message)
                  );
    }
  }

  /**
   * Retry a given observable by a time span
   * @param observable the observable to be retried
   */
  private reconnect(observable: Observable<any>): Observable<any> {
    console.log("Reconnection retry after " + RECONNECT_INTERVAL + "ms")
    return observable.pipe(
                            retryWhen(errors => errors.pipe(
                                                             tap(val => console.log('[Data Service] Try to reconnect', val)),
                                                             delayWhen(_ => timer(RECONNECT_INTERVAL))
                                                           )
                                     )
                          );
  }

  close() {
    this.socket$.complete();
    this.socket$ = undefined;
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  /**
   * Return a custom WebSocket subject which reconnects after failure
   */
  private getNewWebSocket() {
    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('[VesselsPositionService]: connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('[VesselsPositionService]: connection closed');
          this.socket$.unsubscribe();
          console.log('[VesselsPositionService]: socket$ unsubscribed');
          this.socket$ = undefined;
          this.connect( /* reconnect */true );
        }
      },

    });
  }

}
