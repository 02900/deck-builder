import { Card } from './card';
import { darkMagician } from './card.mock';

describe('Card', () => {
  it('should create an instance', () => {
    expect(new Card(darkMagician)).toBeTruthy();
  });
});
