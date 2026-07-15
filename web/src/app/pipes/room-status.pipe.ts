import { Pipe, PipeTransform } from '@angular/core';
import { Reservation } from '../services/reservation.service';

@Pipe({
  name: 'roomStatus',
})
export class RoomStatusPipe implements PipeTransform {
  transform(reservations: Reservation[] | null): string {
    if (!reservations || reservations.length === 0) {
      return 'Free';
    }

    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    const current = reservations.find((r) => {
      const [startH, startM] = r.startTime.split(':').map(Number);
      const [endH, endM] = r.endTime.split(':').map(Number);
      return (
        nowMinutes >= startH * 60 + startM && nowMinutes < endH * 60 + endM
      );
    });

    return current ? `Busy until ${current.endTime}` : 'Free';
  }
}
