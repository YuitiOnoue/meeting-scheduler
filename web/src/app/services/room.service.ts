import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  description: string;
  amenities: string[];
}

export interface AvailabilityParams {
  date: string;
  startTime: string;
  endTime: string;
  [key: string]: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private baseUrl = '/api/rooms';

  getRooms() {
    return this.http.get<Room[]>(this.baseUrl);
  }

  getRoom(id: string) {
    return this.http.get<Room>(`${this.baseUrl}/${id}`);
  }

  getAvailable(params: AvailabilityParams) {
    return this.http.get<Room[]>(`${this.baseUrl}/available`, { params });
  }
}
