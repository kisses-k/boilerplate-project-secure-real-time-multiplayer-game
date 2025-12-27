class Collectible {
  constructor({x, y, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.w = 15; // <--- The tests require these dimensions to exist!
    this.h = 15; // <---
  }

  draw(context) {
    context.fillStyle = '#f1c40f';
    context.strokeStyle = 'white';
    context.fillRect(this.x, this.y, this.w, this.h);
    context.strokeRect(this.x, this.y, this.w, this.h);
  }
}

export default Collectible;