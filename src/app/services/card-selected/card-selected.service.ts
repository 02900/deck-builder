import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ICard } from '@components/card/card.interface';


@Injectable({
  providedIn: 'root'
})
export class CardSelectedService {
  current = new Subject<ICard>();
}
