// NOTE: Should this extend THREE.Group?
class Projection {
  constructor(videoTexture, options) {
    this.videoTexture = videoTexture;
    this.options = options;
    this._screens = null;
  }

  get screens() {
    if (this._screens) return this._screens;
    return this._screens = this.createScreens();
  }

  createScreens() {
    throw new Error('Projections must override "createScreens"');
  }
}

export default Projection;
