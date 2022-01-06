export class Entity {
  constructor() {
    this.shouldBeRemoved = false;
  }

  destroy() {
    //
  }

  markForRemoval() {
    this.shouldBeRemoved = true;
  }

  update(delta, game) {
    //
  }

  render(ctx, canvas) {
    //
  }
}

export default Entity;
