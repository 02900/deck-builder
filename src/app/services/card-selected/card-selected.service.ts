import { Injectable, signal } from '@angular/core';
import { Card } from '@classes/card';

@Injectable({
  providedIn: 'root'
})
export class CardSelectedService {
  readonly current = signal<Card | null>(null);

  select(card: Card): void {
    this.current.set(card);
  }
}
