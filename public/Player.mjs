class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.width = 30;
    this.height = 30;
  }

  draw(context, coin, arr, currPlayer) {
    // If this player instance is "me", draw red. Otherwise gray.
    if(this.id === currPlayer.id) {
        context.fillStyle = '#e74c3c';
    } else {
        context.fillStyle = '#95a5a6';
    }
    
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  movePlayer(dir, speed) {
    if (dir === 'left') this.x -= speed;
    if (dir === 'right') this.x += speed;
    if (dir === 'up') this.y -= speed;
    if (dir === 'down') this.y += speed;
  }

  collision(item) {
    if (
      this.x < item.x + item.w &&
      this.x + this.width > item.x &&
      this.y < item.y + item.h &&
      this.y + this.height > item.y
    ) {
      return true;
    }
  }

  calculateRank(arr) {
    // Sort players by score (descending)
    const sorted = arr.sort((a, b) => b.score - a.score);
    // Find my index + 1
    const position = sorted.findIndex(p => p.id === this.id) + 1;
    
    return `Rank: ${position}/${arr.length}`;
  }
}

export default Player;