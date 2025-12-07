import { 
  AfterViewInit,
  ChangeDetectionStrategy, 
  Component, 
  ElementRef, 
  inject, 
  input, 
  output, 
  signal, 
  viewChild 
} from '@angular/core';
import { Card } from '@classes/card';
import { AnimeCardGeneratorService } from '@services/anime-card-generator/anime-card-generator.service';

@Component({
  selector: 'app-anime-card-modal',
  templateUrl: './anime-card-modal.component.html',
  styleUrls: ['./anime-card-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class AnimeCardModalComponent implements AfterViewInit {
  private readonly animeCardGenerator = inject(AnimeCardGeneratorService);

  readonly card = input.required<Card>();
  readonly close = output<void>();

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  readonly isGenerating = signal(true);
  readonly isReady = signal(false);

  async ngAfterViewInit() {
    await this.generateCard();
  }

  async generateCard(): Promise<void> {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    try {
      // Generate canvas with the card
      const canvas = await this.animeCardGenerator.generateAnimeCardCanvas(this.card());
      
      // Display canvas in modal
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '16px';
      container.innerHTML = '';
      container.appendChild(canvas);
      
      this.isReady.set(true);
      this.isGenerating.set(false);

      // Auto-download
      await this.animeCardGenerator.downloadAnimeCard(this.card());
      
      // Close modal after download
      setTimeout(() => this.close.emit(), 800);
    } catch (error) {
      console.error('Failed to generate card:', error);
      this.isGenerating.set(false);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
