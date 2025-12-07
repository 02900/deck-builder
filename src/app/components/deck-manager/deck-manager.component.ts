import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeckService } from '@services/deck/deck.service';

@Component({
  selector: 'app-deck-manager',
  templateUrl: './deck-manager.component.html',
  styleUrls: ['./deck-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class DeckManagerComponent {
  readonly deckService = inject(DeckService);

  readonly showSaveModal = signal(false);
  readonly showLoadModal = signal(false);
  readonly deckName = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  // Save deck
  openSaveModal(): void {
    this.deckName.set(this.deckService.currentDeckName());
    this.showSaveModal.set(true);
  }

  closeSaveModal(): void {
    this.showSaveModal.set(false);
    this.errorMessage.set('');
  }

  saveDeck(): void {
    const name = this.deckName().trim();
    if (!name) {
      this.errorMessage.set('Please enter a deck name');
      return;
    }
    this.deckService.saveDeck(name);
    this.closeSaveModal();
  }

  // Load deck
  openLoadModal(): void {
    this.showLoadModal.set(true);
  }

  closeLoadModal(): void {
    this.showLoadModal.set(false);
  }

  async loadDeck(deckId: string): Promise<void> {
    this.isLoading.set(true);
    await this.deckService.loadDeck(deckId);
    this.isLoading.set(false);
    this.closeLoadModal();
  }

  deleteDeck(event: Event, deckId: string): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this deck?')) {
      this.deckService.deleteDeck(deckId);
    }
  }

  // New deck
  newDeck(): void {
    if (this.deckService.mainDeck().length > 0 || this.deckService.extraDeck().length > 0) {
      if (!confirm('Create a new deck? Unsaved changes will be lost.')) {
        return;
      }
    }
    this.deckService.newDeck();
  }

  // Export YDK
  exportYdk(): void {
    this.deckService.downloadYdk();
  }

  // Import YDK
  async importYdk(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isLoading.set(true);
    const content = await file.text();
    const result = await this.deckService.importFromYdk(content);
    this.isLoading.set(false);

    if (!result.success) {
      alert(result.error ?? 'Failed to import deck');
    }

    // Reset input
    input.value = '';
  }
}
