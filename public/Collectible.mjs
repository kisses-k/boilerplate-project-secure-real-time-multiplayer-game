class Collectible {
  constructor({x, y, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
  }

  draw(context) {
    context.fillStyle = '#f1c40f'; // Gold color
    context.fillRect(this.x, this.y, 15, 15); // Draw a 15x15 box
    context.strokeStyle = 'white';
    context.strokeRect(this.x, this.y, 15, 15);
  }
}

/*
  Note: Export is handled automatically by the boilerplate loader, 
  but standard ES6 modules use 'export default'. 
  The boilerplate uses <script type="module"> so:
*/
export default Collectible;