import { 
  ChangeDetectionStrategy, 
  Component, 
  HostListener,
  input, 
  output, 
  signal 
} from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { AnchorPreset, RectTransform, StarsConfig, getAnchorValues } from '@services/anime-card-generator/anime-card-config';

type ElementConfig = RectTransform | StarsConfig;

interface GridPreset {
  anchor: AnchorPreset;
  pivotX: number;
  pivotY: number;
}

@Component({
  selector: 'app-rect-transform-modal',
  templateUrl: './rect-transform-modal.component.html',
  styleUrls: ['./rect-transform-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgClass],
})
export class RectTransformModalComponent {
  readonly elementName = input.required<string>();
  readonly elementConfig = input.required<ElementConfig>();
  
  readonly close = output<void>();
  readonly save = output<ElementConfig>();
  
  // Local editable copy
  readonly localConfig = signal<ElementConfig | null>(null);
  
  // Modifier keys state
  readonly shiftPressed = signal(false);
  readonly altPressed = signal(false);
  
  // Grid presets (3x3 like Unity)
  readonly gridPresets: GridPreset[] = [
    { anchor: 'top-left', pivotX: 0, pivotY: 0 },
    { anchor: 'top-center', pivotX: 0.5, pivotY: 0 },
    { anchor: 'top-right', pivotX: 1, pivotY: 0 },
    { anchor: 'middle-left', pivotX: 0, pivotY: 0.5 },
    { anchor: 'center', pivotX: 0.5, pivotY: 0.5 },
    { anchor: 'middle-right', pivotX: 1, pivotY: 0.5 },
    { anchor: 'bottom-left', pivotX: 0, pivotY: 1 },
    { anchor: 'bottom-center', pivotX: 0.5, pivotY: 1 },
    { anchor: 'bottom-right', pivotX: 1, pivotY: 1 },
  ];
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') this.shiftPressed.set(true);
    if (event.key === 'Alt') this.altPressed.set(true);
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') this.shiftPressed.set(false);
    if (event.key === 'Alt') this.altPressed.set(false);
  }
  
  ngOnInit() {
    this.localConfig.set(JSON.parse(JSON.stringify(this.elementConfig())));
  }
  
  get config(): ElementConfig {
    return this.localConfig() ?? this.elementConfig();
  }
  
  isCurrentAnchor(anchor: AnchorPreset): boolean {
    return this.config.anchor === anchor;
  }
  
  selectPreset(preset: GridPreset): void {
    const current = this.config;
    let updated: ElementConfig = { ...current, anchor: preset.anchor };
    
    // Shift: Also set pivot
    if (this.shiftPressed()) {
      updated = { ...updated, pivot: { x: preset.pivotX, y: preset.pivotY } };
    }
    
    // Alt: Also set position to 0,0 (reset position relative to anchor)
    if (this.altPressed()) {
      updated = { ...updated, x: 0, y: 0 };
    }
    
    this.localConfig.set(updated);
    
    // Auto-save and close on selection
    this.save.emit(updated);
    this.close.emit();
  }
  
  onCancel(): void {
    this.close.emit();
  }
}
