import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeckService } from '@services/deck/deck.service';
import { AnimeCardGeneratorService } from '@services/anime-card-generator/anime-card-generator.service';
import JSZip from 'jszip';

@Component({
  selector: 'app-deck-manager',
  templateUrl: './deck-manager.component.html',
  styleUrls: ['./deck-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
})
export class DeckManagerComponent {
  readonly deckService = inject(DeckService);
  private readonly animeCardGenerator = inject(AnimeCardGeneratorService);

  readonly showSaveModal = signal(false);
  readonly showLoadModal = signal(false);
  readonly deckName = signal('');
  readonly isLoading = signal(false);
  readonly isExporting = signal(false);
  readonly exportProgress = signal(0);
  readonly errorMessage = signal('');

  // ... rest of the component ...

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

  // Export Anime Deck
  async exportAnimeDeck(): Promise<void> {
    const mainDeck = this.deckService.mainDeck();
    const extraDeck = this.deckService.extraDeck();
    
    if (mainDeck.length === 0 && extraDeck.length === 0) return;

    this.isExporting.set(true);
    this.exportProgress.set(0);

    try {
      const zip = new JSZip();
      // Get unique cards by ID to avoid duplicates
      const allCards = [...mainDeck, ...extraDeck];
      const uniqueCards = Array.from(new Map(allCards.map(card => [card.id, card])).values());
      
      const total = uniqueCards.length;
      let processed = 0;

      for (const card of uniqueCards) {
        // Set config for this card type (important to ensure correct layout/stars etc)
        this.animeCardGenerator.setConfigForCard(card);
        
        const canvas = await this.animeCardGenerator.generateAnimeCardCanvas(card);
        
        // Convert canvas to blob
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
        
        if (blob) {
          zip.file(`${card.id}.png`, blob);
        }

        processed++;
        this.exportProgress.set(Math.round((processed / total) * 100));
      }

      // Generate zip
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.deckService.currentDeckName() || 'deck'}-anime-cards.zip`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to export anime deck:', error);
      alert('Failed to export deck images. Check console for details.');
    } finally {
      this.isExporting.set(false);
      this.exportProgress.set(0);
    }
  }
}
