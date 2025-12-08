import { Injectable, signal } from '@angular/core';
import { Card } from '@classes/card';
import { AnimeCardConfig, DEFAULT_ANIME_CARD_CONFIG, getConfigForCardType, calculateRect, getAnchorValues } from './anime-card-config';

export interface AnimeCardStyle {
  backgroundColor: string;
  frameColor: string;
  statsStripColor: string;
  isMonster: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnimeCardGeneratorService {
  // Aspect ratio 63:88 from composition
  private readonly CARD_WIDTH = 420;
  private readonly CARD_HEIGHT = Math.round(420 * (88 / 63)); // ~586

  // Editable configuration
  readonly config = signal<AnimeCardConfig>(DEFAULT_ANIME_CARD_CONFIG);
  
  // Current card type for config selection
  private currentCardType: string = '';

  updateConfig(newConfig: Partial<AnimeCardConfig>): void {
    this.config.update(current => ({ ...current, ...newConfig }));
  }

  resetConfig(): void {
    this.config.set(getConfigForCardType(this.currentCardType));
  }
  
  // Set config based on card type
  setConfigForCard(card: Card): void {
    this.currentCardType = card.type;
    this.config.set(getConfigForCardType(card.type));
  }

  getCardStyle(card: Card): AnimeCardStyle {
    const type = card.type.toLowerCase();
    const isMonster = type.includes('monster');
    const hasEffect = type.includes('effect') || 
                      type.includes('fusion') || 
                      type.includes('synchro') || 
                      type.includes('xyz') || 
                      type.includes('link') || 
                      type.includes('ritual') ||
                      type.includes('pendulum');

    if (isMonster) {
      return {
        backgroundColor: hasEffect ? '#d4702a' : '#c9a227', // Orange/Yellow gradient base
        frameColor: hasEffect ? '#8b4513' : '#8b7500',
        statsStripColor: hasEffect ? '#d4702a' : '#c9a227',
        isMonster: true,
      };
    }

    if (type.includes('spell') || type.includes('magic')) {
      return {
        backgroundColor: '#1e8449',
        frameColor: '#145a32',
        statsStripColor: '#1e8449',
        isMonster: false,
      };
    }

    if (type.includes('trap')) {
      return {
        backgroundColor: '#922b5b',
        frameColor: '#641e3e',
        statsStripColor: '#922b5b',
        isMonster: false,
      };
    }

    return {
      backgroundColor: '#1e8449',
      frameColor: '#145a32',
      statsStripColor: '#1e8449',
      isMonster: false,
    };
  }

  private getProxyUrl(url: string): string {
    if (url.includes('images.ygoprodeck.com')) {
      return url.replace('https://images.ygoprodeck.com', '/api/images');
    }
    return url;
  }

  private getAttributeAssetUrl(card: Card): string | null {
    const attribute = card.attribute?.toLowerCase();
    const type = card.type?.toLowerCase() || '';
    
    // Map attributes to asset files
    if (type.includes('spell')) {
      return 'assets/attributes/spell.png';
    }
    if (type.includes('trap')) {
      return 'assets/attributes/Trap.png';
    }
    
    // Monster attributes
    const attributeMap: Record<string, string> = {
      'dark': 'assets/attributes/dark.png',
      'light': 'assets/attributes/light.png',
      'earth': 'assets/attributes/earth.png',
      'water': 'assets/attributes/water.png',
      'fire': 'assets/attributes/fire.png',
      'wind': 'assets/attributes/wind.png',
      'divine': 'assets/attributes/divine.png',
    };
    
    if (attribute && attributeMap[attribute]) {
      return attributeMap[attribute];
    }
    
    return null;
  }

  private getLevelAssetUrl(): string {
    return 'assets/Level.png';
  }

  private getLayoutAssetUrl(card: Card): string {
    const type = card.type?.toLowerCase() || '';
    const name = card.name?.toLowerCase() || '';
    
    // Check for Egyptian God Cards and Sacred Beasts
    if (name.includes('slifer') || name.includes('uria')) {
      return 'assets/Layout/layout-slifer-uria.png';
    }
    if (name.includes('obelisk') || name.includes('raviel')) {
      return 'assets/Layout/layout-obelisk-raviel.png';
    }
    if (name.includes('winged dragon of ra') || name.includes('hamon')) {
      return 'assets/Layout/layout-ra-hamon.png';
    }
    
    // Check for Legendary Dragons
    if (name.includes('legendary dragon') || name.includes('timaeus') || 
        name.includes('critias') || name.includes('hermos')) {
      return 'assets/Layout/layout-legendary-dragon.png';
    }
    
    // Check card type and return appropriate layout
    if (type.includes('token')) {
      return 'assets/Layout/layout-monster-token.png';
    }
    if (type.includes('fusion')) {
      return 'assets/Layout/layout-monster-fusion.png';
    }
    if (type.includes('synchro')) {
      return 'assets/Layout/layout-monster-synchro.png';
    }
    if (type.includes('xyz')) {
      return 'assets/Layout/layout-monster-xyz.png';
    }
    if (type.includes('ritual')) {
      return 'assets/Layout/layout-ritual.png';
    }
    if (type.includes('trap')) {
      return 'assets/Layout/layout-trap.png';
    }
    if (type.includes('spell') || type.includes('magic')) {
      return 'assets/Layout/layout-spell.png';
    }
    if (type.includes('effect') || type.includes('link') || type.includes('pendulum')) {
      return 'assets/Layout/layout-monster-effect.png';
    }
    if (type.includes('monster')) {
      return 'assets/Layout/layout-monster.png';
    }
    
    // Default to spell layout
    return 'assets/Layout/layout-spell.png';
  }

  async preloadImage(url: string): Promise<HTMLImageElement> {
    const proxyUrl = this.getProxyUrl(url);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (proxyUrl === url) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error('Image load error for:', proxyUrl, e);
        reject(new Error('Failed to load image'));
      };
      img.src = proxyUrl;
    });
  }

  async generateAnimeCardCanvas(card: Card): Promise<HTMLCanvasElement> {
    const style = this.getCardStyle(card);
    const cfg = this.config();
    const W = this.CARD_WIDTH;
    const H = this.CARD_HEIGHT;
    
    const canvas = document.createElement('canvas');
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);

    // Define render layers with their z-index
    type RenderLayer = { name: string; zIndex: number; render: () => Promise<void> };
    const layers: RenderLayer[] = [];

    // Artwork layer
    layers.push({
      name: 'artwork',
      zIndex: cfg.artwork.zIndex,
      render: async () => {
        const artRect = calculateRect(cfg.artwork, W, H);
        try {
          const artworkUrl = card.card_images[0].image_url_cropped;
          const img = await this.preloadImage(artworkUrl);
          ctx.save();
          ctx.beginPath();
          ctx.rect(artRect.x, artRect.y, artRect.w, artRect.h);
          ctx.clip();
          const imgRatio = img.width / img.height;
          const areaRatio = artRect.w / artRect.h;
          let drawW, drawH, drawX, drawY;
          if (imgRatio > areaRatio) {
            drawH = artRect.h;
            drawW = artRect.h * imgRatio;
            drawX = artRect.x - (drawW - artRect.w) / 2;
            drawY = artRect.y;
          } else {
            drawW = artRect.w;
            drawH = artRect.w / imgRatio;
            drawX = artRect.x;
            drawY = artRect.y - (drawH - artRect.h) / 2;
          }
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();
        } catch (e) {
          console.error('Failed to load artwork:', e);
          ctx.fillStyle = '#333';
          ctx.fillRect(artRect.x, artRect.y, artRect.w, artRect.h);
        }
      }
    });

    // Layout frame layer
    layers.push({
      name: 'layout',
      zIndex: cfg.layout.zIndex,
      render: async () => {
        try {
          const layoutUrl = this.getLayoutAssetUrl(card);
          const layoutImg = await this.preloadImage(layoutUrl);
          const layoutRect = calculateRect(cfg.layout, W, H);
          ctx.drawImage(layoutImg, layoutRect.x, layoutRect.y, layoutRect.w, layoutRect.h);
        } catch (e) {
          console.error('Failed to load layout:', e);
        }
      }
    });

    // Stars layer (only for monsters)
    if (style.isMonster && card.level) {
      layers.push({
        name: 'stars',
        zIndex: cfg.stars.zIndex,
        render: async () => {
          const starSize = W * cfg.stars.size;
          const gap = W * cfg.stars.gap;
          const totalStarsWidth = card.level! * starSize + (card.level! - 1) * gap;
          const anchorPos = getAnchorValues(cfg.stars.anchor);
          const anchorX = anchorPos.x * W;
          const anchorY = anchorPos.y * H;
          const starsX = anchorX + (cfg.stars.x * W) - (cfg.stars.pivot.x * totalStarsWidth);
          const starsY = anchorY + (cfg.stars.y * H) - (cfg.stars.pivot.y * starSize);
          try {
            const levelImg = await this.preloadImage(this.getLevelAssetUrl());
            for (let i = 0; i < card.level!; i++) {
              const starX = starsX + i * (starSize + gap);
              ctx.drawImage(levelImg, starX, starsY, starSize, starSize);
            }
          } catch (e) {
            for (let i = 0; i < card.level!; i++) {
              const starX = starsX + i * (starSize + gap);
              this.drawStar(ctx, starX + starSize/2, starsY + starSize/2, starSize/2);
            }
          }
        }
      });
    }

    // Attribute icon layer
    const attrUrl = this.getAttributeAssetUrl(card);
    if (attrUrl) {
      layers.push({
        name: 'attribute',
        zIndex: cfg.attribute.zIndex,
        render: async () => {
          try {
            const attrImg = await this.preloadImage(attrUrl!);
            const attrRect = calculateRect(cfg.attribute, W, H);
            ctx.drawImage(attrImg, attrRect.x, attrRect.y, attrRect.w, attrRect.h);
          } catch (e) {
            console.error('Failed to load attribute icon:', e);
          }
        }
      });
    }

    // ATK layer (only for monsters)
    if (style.isMonster) {
      layers.push({
        name: 'atk',
        zIndex: cfg.atk.zIndex,
        render: async () => {
          const atkRect = calculateRect(cfg.atk, W, H);
          ctx.fillStyle = '#000';
          ctx.font = `bold ${Math.round(H * cfg.fontSize)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(card.atk ?? '?'), atkRect.x + atkRect.w/2, atkRect.y + atkRect.h/2);
        }
      });

      // DEF layer
      layers.push({
        name: 'def',
        zIndex: cfg.def.zIndex,
        render: async () => {
          const defRect = calculateRect(cfg.def, W, H);
          ctx.fillStyle = '#000';
          ctx.font = `bold ${Math.round(H * cfg.fontSize)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(card.def ?? '?'), defRect.x + defRect.w/2, defRect.y + defRect.h/2);
        }
      });
    }

    // Sort layers by z-index and render in order
    layers.sort((a, b) => a.zIndex - b.zIndex);
    for (const layer of layers) {
      await layer.render();
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    return canvas;
  }

  private drawStatBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, borderColor: string, borderWidth: number = 3): void {
    // Cream/beige background
    ctx.fillStyle = '#f5f0dc';
    ctx.fillRect(x, y, w, h);
    
    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(x, y, w, h);
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number): void {
    // Draw a star with gradient (red/orange like in the image)
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ff6600');
    gradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.5;
    
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI / spikes) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient): void {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  private strokeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
  }

  private clipRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxHeight: number): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    const maxY = y + maxHeight - lineHeight;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        if (currentY > maxY) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return;
        }
        ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (currentY <= maxY + lineHeight) {
      ctx.fillText(line.trim(), x, currentY);
    }
  }

  async downloadAnimeCard(card: Card): Promise<void> {
    try {
      const canvas = await this.generateAnimeCardCanvas(card);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${card.name.replace(/[^a-zA-Z0-9]/g, '_')}_anime.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error generating anime card:', error);
      throw error;
    }
  }
}
