var DEFAULT_CLIP = '__auto__';

/**
 * animation-mixer
 *
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations.
 */
module.exports = {
  schema: {
    clip:  {default: DEFAULT_CLIP},
    duration: {default: 0}
  },

  init: function () {
    this.model =        /* {THREE.Mesh}            */ null;
    this.mixer =        /* {THREE.AnimationMixer}  */ null;
    this.activeAction = /* {THREE.AnimationAction} */ null;

    var model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', function(e) {
        this.load(e.detail.model);
      }.bind(this));
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    if (this.data.clip) this.playClip(this.data.clip);
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (previousData) {
    if (!previousData) return;

    var data = this.data;

    if (data.clip !== previousData.clip) {
      this.playClip(data.clip);
    } else if (data.duration !== previousData.duration) {
      if (this.activeAction) {
        this.activeAction.setDuration(data.duration);
      }
    }
  },

  playClip: function (clipName) {
    if (!this.mixer) return;

    var clip,
        data = this.data,
        model = this.model,
        animations = model.animations || (model.geometry || {}).animations || [];

    if (!animations.length) { return; }

    clip = clipName === DEFAULT_CLIP
      ? animations[0]
      : THREE.AnimationClip.findByName(animations, data.clip);

    if (!clip) {
      console.error('[animation-mixer] Animation "%s" not found.', data.clip);
      return;
    }

    this.activeAction = this.mixer.clipAction(clip, model);
    if (data.duration) {
      this.activeAction.setDuration(data.duration);
    }
    this.activeAction.play();
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
  }
};