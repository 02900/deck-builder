import { Injectable } from '@angular/core';
import { Card } from '@classes/card';

export interface AnimeCardStyle {
  backgroundColor: string;
  borderColor: string;
  isMonster: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AnimeCardGeneratorService {
  private readonly CARD_WIDTH = 420;
  private readonly CARD_HEIGHT = 610;

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
        backgroundColor: hasEffect ? '#ff8c00' : '#ffd700',
        borderColor: hasEffect ? '#cc7000' : '#ccac00',
        isMonster: true,
      };
    }

    if (type.includes('spell') || type.includes('magic')) {
      return {
        backgroundColor: '#1d9e5a',
        borderColor: '#157a45',
        isMonster: false,
      };
    }

    if (type.includes('trap')) {
      return {
        backgroundColor: '#bc5a84',
        borderColor: '#9a4a6c',
        isMonster: false,
      };
    }

    return {
      backgroundColor: '#1d9e5a',
      borderColor: '#157a45',
      isMonster: false,
    };
  }

  private getProxyUrl(url: string): string {
    // Convert external image URL to proxy URL for CORS
    // https://images.ygoprodeck.com/images/cards_cropped/46986421.jpg
    // -> /api/images/images/cards_cropped/46986421.jpg
    if (url.includes('images.ygoprodeck.com')) {
      return url.replace('https://images.ygoprodeck.com', '/api/images');
    }
    return url;
  }

  async preloadImage(url: string): Promise<HTMLImageElement> {
    const proxyUrl = this.getProxyUrl(url);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Only set crossOrigin if not using proxy
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
    const canvas = document.createElement('canvas');
    canvas.width = this.CARD_WIDTH * 2; // 2x for higher quality
    canvas.height = this.CARD_HEIGHT * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2); // Scale for quality

    // Draw card background
    this.drawRoundedRect(ctx, 0, 0, this.CARD_WIDTH, this.CARD_HEIGHT, 16, style.backgroundColor);
    
    // Draw border
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = 4;
    this.strokeRoundedRect(ctx, 2, 2, this.CARD_WIDTH - 4, this.CARD_HEIGHT - 4, 14);

    // Draw name box
    this.drawRoundedRect(ctx, 16, 16, this.CARD_WIDTH - 32, 44, 8, 'rgba(255,255,255,0.4)');
    ctx.fillStyle = '#000';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(card.name, 26, 46, this.CARD_WIDTH - 52);

    // Draw stars for monsters
    let artworkY = 70;
    if (style.isMonster && card.level) {
      const starY = 68;
      ctx.font = '20px Arial';
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      const stars = '★'.repeat(card.level);
      ctx.fillText(stars, this.CARD_WIDTH / 2, starY + 16);
      ctx.textAlign = 'left';
      artworkY = 92;
    }

    // Draw artwork frame
    const artworkX = 16;
    const artworkWidth = this.CARD_WIDTH - 32;
    const artworkHeight = 280;
    
    this.drawRoundedRect(ctx, artworkX, artworkY, artworkWidth, artworkHeight, 12, 'rgba(0,0,0,0.3)');
    
    // Draw artwork image
    try {
      const artworkUrl = card.card_images[0].image_url_cropped;
      const img = await this.preloadImage(artworkUrl);
      
      // Clip to rounded rect
      ctx.save();
      this.clipRoundedRect(ctx, artworkX + 4, artworkY + 4, artworkWidth - 8, artworkHeight - 8, 10);
      ctx.drawImage(img, artworkX + 4, artworkY + 4, artworkWidth - 8, artworkHeight - 8);
      ctx.restore();
    } catch (e) {
      console.error('Failed to load artwork:', e);
    }

    // Draw type line
    const typeY = artworkY + artworkHeight + 12;
    this.drawRoundedRect(ctx, 16, typeY, this.CARD_WIDTH - 32, 28, 6, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(card.type.toUpperCase(), 26, typeY + 19);
    if (card.attribute) {
      ctx.textAlign = 'right';
      ctx.fillText(card.attribute.toUpperCase(), this.CARD_WIDTH - 26, typeY + 19);
      ctx.textAlign = 'left';
    }

    // Draw description box
    const descY = typeY + 38;
    const descHeight = 90;
    this.drawRoundedRect(ctx, 16, descY, this.CARD_WIDTH - 32, descHeight, 8, 'rgba(255,255,255,0.9)');
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    this.wrapText(ctx, card.desc, 26, descY + 18, this.CARD_WIDTH - 52, 14, descHeight - 20);

    // Draw stats for monsters
    if (style.isMonster) {
      const statsY = descY + descHeight + 10;
      this.drawRoundedRect(ctx, 16, statsY, this.CARD_WIDTH - 32, 32, 6, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      
      const statsText = [];
      if (card.atk !== undefined) statsText.push(`ATK/${card.atk}`);
      if (card.def !== undefined) statsText.push(`DEF/${card.def}`);
      ctx.fillText(statsText.join('    '), this.CARD_WIDTH - 26, statsY + 22);
      ctx.textAlign = 'left';
    }

    // Draw card ID
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(String(card.id), this.CARD_WIDTH - 16, this.CARD_HEIGHT - 12);
    ctx.textAlign = 'left';

    return canvas;
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string): void {
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
