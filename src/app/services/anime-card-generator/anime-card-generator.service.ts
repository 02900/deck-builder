import { Injectable, signal } from '@angular/core';
import { Card } from '@classes/card';
import { AnimeCardConfig, DEFAULT_ANIME_CARD_CONFIG } from './anime-card-config';

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

  updateConfig(newConfig: Partial<AnimeCardConfig>): void {
    this.config.update(current => ({ ...current, ...newConfig }));
  }

  resetConfig(): void {
    this.config.set(DEFAULT_ANIME_CARD_CONFIG);
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
    
    // Check card type and return appropriate layout
    if (type.includes('fusion')) {
      return 'assets/Layout/layout-monster-fusion.png';
    }
    if (type.includes('trap')) {
      return 'assets/Layout/layout-monster-trap.png';
    }
    if (type.includes('spell') || type.includes('magic')) {
      return 'assets/Layout/layout-monster-spell.png';
    }
    if (type.includes('effect') || type.includes('synchro') || type.includes('xyz') || 
        type.includes('link') || type.includes('ritual') || type.includes('pendulum')) {
      return 'assets/Layout/layout-monster-effect.png';
    }
    if (type.includes('monster')) {
      return 'assets/Layout/layout-monster.png';
    }
    
    // Default to spell layout
    return 'assets/Layout/layout-monster-spell.png';
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

    // === STEP 1: Draw artwork CLIPPED to artwork area ===
    const artX = W * cfg.artwork.x;
    const artY = H * cfg.artwork.y;
    const artW = W * cfg.artwork.w;
    const artH = H * cfg.artwork.h;
    
    try {
      const artworkUrl = card.card_images[0].image_url_cropped;
      const img = await this.preloadImage(artworkUrl);
      
      // Clip to artwork area
      ctx.save();
      ctx.beginPath();
      ctx.rect(artX, artY, artW, artH);
      ctx.clip();
      
      // Cover fit: image is 1:1, target area is ~278:263 (wider than tall)
      // We need to scale to cover and center
      const imgRatio = img.width / img.height; // 1:1 = 1
      const areaRatio = artW / artH; // ~278:263 > 1
      let drawW, drawH, drawX, drawY;
      
      if (imgRatio > areaRatio) {
        // Image is wider than area - fit height, crop width
        drawH = artH;
        drawW = artH * imgRatio;
        drawX = artX - (drawW - artW) / 2;
        drawY = artY;
      } else {
        // Image is taller than area (or equal) - fit width, crop height
        drawW = artW;
        drawH = artW / imgRatio;
        drawX = artX;
        drawY = artY - (drawH - artH) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    } catch (e) {
      console.error('Failed to load artwork:', e);
      ctx.fillStyle = '#333';
      ctx.fillRect(artX, artY, artW, artH);
    }

    // === STEP 2: Draw layout frame on top (100% size) ===
    try {
      const layoutUrl = this.getLayoutAssetUrl(card);
      const layoutImg = await this.preloadImage(layoutUrl);
      ctx.drawImage(layoutImg, 0, 0, W, H);
    } catch (e) {
      console.error('Failed to load layout:', e);
    }

    // === STEP 3: LEVEL STARS ===
    if (style.isMonster && card.level) {
      const starsY = H * cfg.stars.y;
      const starSize = W * cfg.stars.size;
      const gap = W * cfg.stars.gap;
      const totalStarsWidth = card.level * starSize + (card.level - 1) * gap;
      const starsStartX = (W - totalStarsWidth) / 2;
      
      try {
        const levelImg = await this.preloadImage(this.getLevelAssetUrl());
        for (let i = 0; i < card.level; i++) {
          const starX = starsStartX + i * (starSize + gap);
          ctx.drawImage(levelImg, starX, starsY, starSize, starSize);
        }
      } catch (e) {
        // Fallback to drawn stars
        for (let i = 0; i < card.level; i++) {
          const starX = starsStartX + i * (starSize + gap);
          this.drawStar(ctx, starX + starSize/2, starsY + starSize/2, starSize/2);
        }
      }
    }

    // === STEP 4: ATTRIBUTE ICON ===
    const attrUrl = this.getAttributeAssetUrl(card);
    if (attrUrl) {
      try {
        const attrImg = await this.preloadImage(attrUrl);
        const attrW = W * cfg.attribute.w;
        const attrH = H * cfg.attribute.h;
        const attrX = W * cfg.attribute.x;
        const attrY = H * cfg.attribute.y;
        ctx.drawImage(attrImg, attrX, attrY, attrW, attrH);
      } catch (e) {
        console.error('Failed to load attribute icon:', e);
      }
    }

    // === STEP 5: ATK/DEF VALUES ===
    if (style.isMonster) {
      const atkBoxX = W * cfg.atk.x;
      const atkBoxY = H * cfg.atk.y;
      const atkBoxW = W * cfg.atk.w;
      const atkBoxH = H * cfg.atk.h;
      
      ctx.fillStyle = '#000';
      ctx.font = `bold ${Math.round(H * cfg.fontSize)}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(card.atk ?? '?'), atkBoxX + atkBoxW/2, atkBoxY + atkBoxH/2);

      const defBoxX = W * cfg.def.x;
      const defBoxW = W * cfg.def.w;
      ctx.fillText(String(card.def ?? '?'), defBoxX + defBoxW/2, atkBoxY + atkBoxH/2);
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
