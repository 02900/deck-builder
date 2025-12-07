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
import { NgClass } from '@angular/common';
import { Card } from '@classes/card';
import { AnimeCardGeneratorService } from '@services/anime-card-generator/anime-card-generator.service';
import { AnimeCardConfig, calculateRect, getAnchorValues, RectTransform, StarsConfig } from '@services/anime-card-generator/anime-card-config';
import { RectTransformModalComponent } from '../rect-transform-modal/rect-transform-modal.component';

@Component({
  selector: 'app-anime-card-modal',
  templateUrl: './anime-card-modal.component.html',
  styleUrls: ['./anime-card-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, RectTransformModalComponent],
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
  
  // Signal to track if currently dragging (for showing distance guides)
  readonly isDraggingSignal = signal(false);
  
  // RectTransform modal state
  readonly showRectModal = signal(false);
  readonly rectModalElement = signal<keyof AnimeCardConfig | null>(null);
  
  // Computed distance guides for Figma-style indicators
  readonly distanceGuides = computed(() => {
    const selected = this.selectedElement();
    const canvas = this.canvasElement();
    if (!selected || selected === 'fontSize' || !canvas) return null;
    
    const cfg = this.config();
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    
    let rect: { x: number; y: number; w: number; h: number };
    
    if (selected === 'stars') {
      const stars = cfg.stars;
      const starSize = stars.size * canvasWidth;
      const anchorPos = getAnchorValues(stars.anchor);
      rect = {
        x: anchorPos.x * canvasWidth + stars.x * canvasWidth - stars.pivot.x * starSize * 4,
        y: anchorPos.y * canvasHeight + stars.y * canvasHeight - stars.pivot.y * starSize,
        w: starSize * 4,
        h: starSize
      };
    } else {
      const element = cfg[selected] as RectTransform;
      rect = calculateRect(element, canvasWidth, canvasHeight);
    }
    
    // Calculate distances in pixels
    const top = rect.y;
    const left = rect.x;
    const right = canvasWidth - rect.x - rect.w;
    const bottom = canvasHeight - rect.y - rect.h;
    
    return {
      top: Math.round(top),
      left: Math.round(left),
      right: Math.round(right),
      bottom: Math.round(bottom),
      // Positions for the guide lines
      topLineY: top / 2,
      bottomLineY: rect.y + rect.h + bottom / 2,
      leftLineX: left / 2,
      rightLineX: rect.x + rect.w + right / 2,
      // Element bounds
      elementTop: rect.y,
      elementLeft: rect.x,
      elementWidth: rect.w,
      elementHeight: rect.h,
      canvasWidth,
      canvasHeight
    };
  });
  
  // Computed overlay style for reactivity - based on canvas dimensions
  readonly overlayStyle = computed(() => {
    const selected = this.selectedElement();
    const canvas = this.canvasElement();
    if (!selected || selected === 'fontSize' || !canvas) return null;
    
    const cfg = this.config();
    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;
    
    let rect: { x: number; y: number; w: number; h: number };
    
    // Handle different element types
    if (selected === 'stars') {
      const stars = cfg.stars;
      const starSize = stars.size * canvasWidth;
      const anchorPos = getAnchorValues(stars.anchor);
      rect = {
        x: anchorPos.x * canvasWidth + stars.x * canvasWidth - stars.pivot.x * starSize * 4,
        y: anchorPos.y * canvasHeight + stars.y * canvasHeight - stars.pivot.y * starSize,
        w: starSize * 4,
        h: starSize
      };
    } else {
      const element = cfg[selected] as RectTransform;
      rect = calculateRect(element, canvasWidth, canvasHeight);
    }
    
    return {
      top: `${rect.y}px`,
      left: `${rect.x}px`,
      width: `${rect.w}px`,
      height: `${rect.h}px`
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sectionData = (current as any)[section];
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

  // === RECT TRANSFORM MODAL ===
  
  openRectModal(element: keyof AnimeCardConfig): void {
    if (element === 'fontSize') return;
    this.rectModalElement.set(element);
    this.showRectModal.set(true);
  }
  
  closeRectModal(): void {
    this.showRectModal.set(false);
    this.rectModalElement.set(null);
  }
  
  saveRectConfig(newConfig: RectTransform | StarsConfig): void {
    const element = this.rectModalElement();
    if (!element || element === 'fontSize') return;
    
    const current = this.config();
    this.animeCardGenerator.config.set({
      ...current,
      [element]: newConfig
    });
    this.generateCard();
  }
  
  isStarsElement(element: keyof AnimeCardConfig | null): boolean {
    return element === 'stars';
  }
  
  getElementConfig(element: keyof AnimeCardConfig | null): RectTransform | StarsConfig | null {
    if (!element || element === 'fontSize') return null;
    return this.config()[element] as RectTransform | StarsConfig;
  }

  // === DRAG & DROP HANDLERS ===
  
  onOverlayMouseDown(event: MouseEvent, type: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br'): void {
    event.preventDefault();
    event.stopPropagation();
    
    const selected = this.selectedElement();
    if (!selected || selected === 'fontSize') return;
    
    this.isDragging = true;
    this.isDraggingSignal.set(true);
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
        // Allow negative coordinates and values > 1
        const newY = this.dragStartConfig.y + deltaY;
        newConfig = {
          stars: { ...current.stars, y: newY }
        };
      } else if (this.dragType?.startsWith('resize')) {
        // Resize changes star size (keep positive size)
        const newSize = Math.max(0.01, this.dragStartConfig.h + deltaY);
        newConfig = {
          stars: { ...current.stars, size: newSize }
        };
      }
    } else {
      const elementConfig = current[selected] as { x: number; y: number; w: number; h: number };
      
      // Allow negative coordinates and values > 1
      // Keep minimum width/height to prevent element disappearing
      const minSize = 0.01;
      
      switch (this.dragType) {
        case 'move':
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: this.dragStartConfig.x + deltaX,
              y: this.dragStartConfig.y + deltaY
            }
          };
          break;
          
        case 'resize-br': // Bottom-right: change width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              w: Math.max(minSize, this.dragStartConfig.w + deltaX),
              h: Math.max(minSize, this.dragStartConfig.h + deltaY)
            }
          };
          break;
          
        case 'resize-bl': // Bottom-left: change x, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: this.dragStartConfig.x + deltaX,
              w: Math.max(minSize, this.dragStartConfig.w - deltaX),
              h: Math.max(minSize, this.dragStartConfig.h + deltaY)
            }
          };
          break;
          
        case 'resize-tr': // Top-right: change y, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              y: this.dragStartConfig.y + deltaY,
              w: Math.max(minSize, this.dragStartConfig.w + deltaX),
              h: Math.max(minSize, this.dragStartConfig.h - deltaY)
            }
          };
          break;
          
        case 'resize-tl': // Top-left: change x, y, width and height
          newConfig = {
            [selected]: {
              ...elementConfig,
              x: this.dragStartConfig.x + deltaX,
              y: this.dragStartConfig.y + deltaY,
              w: Math.max(minSize, this.dragStartConfig.w - deltaX),
              h: Math.max(minSize, this.dragStartConfig.h - deltaY)
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
    this.isDraggingSignal.set(false);
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
