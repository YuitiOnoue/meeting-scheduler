import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Reservation {
  id: string;
  roomId: string;
  title: string;
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = '/api/reservations';

  getReservations(roomId: string, date: string) {
    const params: Record<string, string> = { roomId, date };
    return this.http.get<Reservation[]>(this.baseUrl, { params });
  }
}
