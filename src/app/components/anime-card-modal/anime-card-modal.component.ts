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
  
  // Drag state
  private isDragging = false;
  private dragType: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartConfig: { x: number; y: number; w: number; h: number } | null = null;
  
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
    // Set config based on card type
    this.animeCardGenerator.setConfigForCard(this.card());
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

  // === DRAG & DROP HANDLERS ===
  
  onOverlayMouseDown(event: MouseEvent, type: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br'): void {
    event.preventDefault();
    event.stopPropagation();
    
    const selected = this.selectedElement();
    if (!selected || selected === 'fontSize') return;
    
    this.isDragging = true;
    this.dragType = type;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    
    // Store initial config values
    const cfg = this.config();
    const element = cfg[selected] as { x?: number; y?: number; w?: number; h?: number; size?: number };
    
    if (selected === 'stars') {
      this.dragStartConfig = {
        x: 0.1,
        y: element.y ?? 0,
        w: 0.8,
        h: element.size ?? 0.04
      };
    } else {
      this.dragStartConfig = {
        x: element.x ?? 0,
        y: element.y ?? 0,
        w: element.w ?? 0.1,
        h: element.h ?? 0.1
      };
    }
    
    // Add global listeners
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }
  
  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging || !this.dragStartConfig) return;
    
    const canvas = this.canvasElement();
    const selected = this.selectedElement();
    if (!canvas || !selected || selected === 'fontSize') return;
    
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    
    // Calculate delta in relative units (0-1)
    const deltaX = (event.clientX - this.dragStartX) / canvasWidth;
    const deltaY = (event.clientY - this.dragStartY) / canvasHeight;
    
    const current = this.config();
    let newConfig: Partial<AnimeCardConfig> = {};
    
    if (selected === 'stars') {
      // Stars only support Y movement and size change
      if (this.dragType === 'move') {
        const newY = Math.max(0, Math.min(1, this.dragStartConfig.y + deltaY));
        newConfig = {
          stars: { ...current.stars, y: newY }
        };
      } else if (this.dragType?.startsWith('resize')) {
        // Resize changes star size
        const newSize = Math.max(0.02, Math.min(0.1, this.dragStartConfig.h + deltaY));
        newConfig = {
          stars: { ...current.stars, size: newSize }
        };
      }
    } else {
      const elementConfig = current[selected] as { x: number; y: number; w: number; h: number };
      
      switch (this.dragType) {
        case 'move':
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: Math.max(0, Math.min(1, this.dragStartConfig.x + deltaX)),
              y: Math.max(0, Math.min(1, this.dragStartConfig.y + deltaY))
            }
          };
          break;
          
        case 'resize-br': // Bottom-right: change width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              w: Math.max(0.05, Math.min(1, this.dragStartConfig.w + deltaX)),
              h: Math.max(0.05, Math.min(1, this.dragStartConfig.h + deltaY))
            }
          };
          break;
          
        case 'resize-bl': // Bottom-left: change x, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: Math.max(0, Math.min(1, this.dragStartConfig.x + deltaX)),
              w: Math.max(0.05, Math.min(1, this.dragStartConfig.w - deltaX)),
              h: Math.max(0.05, Math.min(1, this.dragStartConfig.h + deltaY))
            }
          };
          break;
          
        case 'resize-tr': // Top-right: change y, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              y: Math.max(0, Math.min(1, this.dragStartConfig.y + deltaY)),
              w: Math.max(0.05, Math.min(1, this.dragStartConfig.w + deltaX)),
              h: Math.max(0.05, Math.min(1, this.dragStartConfig.h - deltaY))
            }
          };
          break;
          
        case 'resize-tl': // Top-left: change x, y, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: Math.max(0, Math.min(1, this.dragStartConfig.x + deltaX)),
              y: Math.max(0, Math.min(1, this.dragStartConfig.y + deltaY)),
              w: Math.max(0.05, Math.min(1, this.dragStartConfig.w - deltaX)),
              h: Math.max(0.05, Math.min(1, this.dragStartConfig.h - deltaY))
            }
          };
          break;
      }
    }
    
    // Update config (this updates sliders via two-way binding)
    this.animeCardGenerator.config.set({ ...current, ...newConfig });
    
    // Regenerate card preview
    this.generateCard();
  };
  
  private onMouseUp = (): void => {
    this.isDragging = false;
    this.dragType = null;
    this.dragStartConfig = null;
    
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };
  
  // Click on canvas to select element at position
  onCanvasClick(event: MouseEvent): void {
    const canvas = this.canvasElement();
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / canvas.offsetWidth;
    const y = (event.clientY - rect.top) / canvas.offsetHeight;
    
    const cfg = this.config();
    
    // Check which element was clicked (in order of z-index priority)
    // ATK box
    if (this.isPointInRect(x, y, cfg.atk)) {
      this.selectedElement.set('atk');
      return;
    }
    // DEF box
    if (this.isPointInRect(x, y, cfg.def)) {
      this.selectedElement.set('def');
      return;
    }
    // Attribute
    if (this.isPointInRect(x, y, cfg.attribute)) {
      this.selectedElement.set('attribute');
      return;
    }
    // Stars (horizontal band)
    if (y >= cfg.stars.y && y <= cfg.stars.y + cfg.stars.size) {
      this.selectedElement.set('stars');
      return;
    }
    // Artwork
    if (this.isPointInRect(x, y, cfg.artwork)) {
      this.selectedElement.set('artwork');
      return;
    }
    
    // Click outside - deselect
    this.selectedElement.set(null);
  }
  
  private isPointInRect(x: number, y: number, rect: { x: number; y: number; w: number; h: number }): boolean {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }
}
