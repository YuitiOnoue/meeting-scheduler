import { Component, OnInit, inject } from '@angular/core';
import { RoomService, Room } from '../services/room.service';
import {
  ReservationService,
  Reservation,
} from '../services/reservation.service';
import { RoomStatusPipe } from '../pipes/room-status.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [RoomStatusPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);
  rooms: Room[] = [];
  reservationsByRoom: Record<string, Reservation[]> = {};

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.roomService.getRooms().subscribe((rooms) => {
      this.rooms = rooms;
      rooms.forEach((room) => {
        this.reservationService
          .getReservations(room.id, today)
          .subscribe((reservations) => {
            this.reservationsByRoom[room.id] = reservations;
          });
      });
    });
  }
}
