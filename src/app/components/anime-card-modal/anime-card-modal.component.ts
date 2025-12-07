import { 
  AfterViewInit,
  ChangeDetectionStrategy, 
  Component, 
  computed,
  ElementRef, 
  inject, 
  input, 
  output, 
  signal, 
  viewChild
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { Card } from '@classes/card';
import { AnimeCardGeneratorService } from '@services/anime-card-generator/anime-card-generator.service';
import { AnimeCardConfig } from '@services/anime-card-generator/anime-card-config';

@Component({
  selector: 'app-anime-card-modal',
  templateUrl: './anime-card-modal.component.html',
  styleUrls: ['./anime-card-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
})
export class AnimeCardModalComponent implements AfterViewInit {
  private readonly animeCardGenerator = inject(AnimeCardGeneratorService);

  readonly card = input.required<Card>();
  readonly close = output<void>();

  readonly canvasContainer = viewChild<ElementRef<HTMLDivElement>>('canvasContainer');
  readonly isGenerating = signal(true);
  readonly isReady = signal(false);
  
  // Expose config signal from service
  readonly config = this.animeCardGenerator.config;
  
  // Selected element for visual highlight
  readonly selectedElement = signal<keyof AnimeCardConfig | null>(null);
  
  // Canvas element reference as signal
  readonly canvasElement = signal<HTMLCanvasElement | null>(null);
  
  // Computed overlay style for reactivity - based on canvas dimensions
  readonly overlayStyle = computed(() => {
    const selected = this.selectedElement();
    const canvas = this.canvasElement();
    if (!selected || selected === 'fontSize' || !canvas) return null;
    
    const cfg = this.config();
    const element = cfg[selected] as { x?: number; y?: number; w?: number; h?: number; size?: number; gap?: number };
    
    if (!element) return null;
    
    // Get canvas rendered dimensions
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    
    // Handle different element types
    if (selected === 'stars') {
      // Stars only have y, size, gap - show a horizontal band
      const top = (element.y ?? 0) * canvasHeight;
      const left = 0.1 * canvasWidth;
      const width = 0.8 * canvasWidth;
      const height = (element.size ?? 0.04) * canvasHeight;
      
      return {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`
      };
    }
    
    // For elements with x, y, w, h
    const top = (element.y ?? 0) * canvasHeight;
    const left = (element.x ?? 0) * canvasWidth;
    const width = (element.w ?? 0.1) * canvasWidth;
    const height = (element.h ?? 0.1) * canvasHeight;
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      height: `${height}px`
    };
  });

  async ngAfterViewInit() {
    await this.generateCard();
  }

  async generateCard(): Promise<void> {
    const container = this.canvasContainer()?.nativeElement;
    if (!container) return;

    this.isGenerating.set(true);
    
    try {
      const canvas = await this.animeCardGenerator.generateAnimeCardCanvas(this.card());
      
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.borderRadius = '16px';
      container.innerHTML = '';
      container.appendChild(canvas);
      
      this.canvasElement.set(canvas);
      this.isReady.set(true);
      this.isGenerating.set(false);
    } catch (error) {
      console.error('Failed to generate card:', error);
      this.isGenerating.set(false);
    }
  }

  async downloadCard(): Promise<void> {
    await this.animeCardGenerator.downloadAnimeCard(this.card());
  }

  updateConfigValue(section: keyof AnimeCardConfig, key: string, event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    const current = this.config();
    
    // Set selected element for visual highlight
    this.selectedElement.set(section);
    
    if (section === 'fontSize') {
      this.animeCardGenerator.config.set({ ...current, fontSize: value });
    } else {
      const sectionData = current[section] as Record<string, number>;
      this.animeCardGenerator.config.set({
        ...current,
        [section]: { ...sectionData, [key]: value }
      });
    }
    
    this.generateCard();
  }

  selectElement(section: keyof AnimeCardConfig | null): void {
    this.selectedElement.set(section);
  }

  updateFontSize(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value);
    const current = this.config();
    this.animeCardGenerator.config.set({ ...current, fontSize: value });
    this.generateCard();
  }

  resetConfig(): void {
    this.animeCardGenerator.resetConfig();
    this.generateCard();
  }

  async copyConfigJson(): Promise<void> {
    const json = JSON.stringify(this.config(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      // Could add a toast notification here
      console.log('Config copied to clipboard');
    } catch (e) {
      console.error('Failed to copy config:', e);
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
