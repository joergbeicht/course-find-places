import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap } from 'rxjs/operators';

/* providedIn: 'root' => damit ist der Service app weit verfügbar und
   kann überall injectetd werden */

@Injectable({ providedIn: 'root' })
export class BookingService {
  // private _bookings: Booking[] = [
  //     {
  //         id: '4711',
  //         placeId: 'p1',
  //         placeTitle: 'Manhattan Mansion',
  //         guestNumber: 2,
  //         userId: 'xyz'
  //     }
  // ];

  // get bookings() {
  //   return [...this._bookings];
  // }

  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.concat(newBooking));
      })
    );
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(bookings.filter(b => b.id !== bookingId));
      })
    );
  }
}
