// Tiny synth sound effects -- no audio files needed.
// Add a sound: add an entry to SFX, then call Game.Audio.play('name').
// Each step: {f: startFreq, to: endFreq, t: seconds, type: 'square'|'triangle'|'sawtooth'|'sine'|'noise', v: volume}
Game.Audio = (function () {
  var SFX = {
    sword:   [{ f: 900, to: 300, t: 0.08, type: 'sawtooth', v: 0.15 }],
    beam:    [{ f: 1200, to: 600, t: 0.15, type: 'square', v: 0.08 }],
    hit:     [{ f: 300, to: 80, t: 0.1, type: 'square', v: 0.2 }],
    kill:    [{ f: 400, to: 40, t: 0.2, type: 'noise', v: 0.2 }],
    hurt:    [{ f: 200, to: 60, t: 0.25, type: 'square', v: 0.25 }],
    pickup:  [{ f: 880, t: 0.06, type: 'square', v: 0.1 }, { f: 1320, t: 0.08, type: 'square', v: 0.1 }],
    rupee:   [{ f: 1500, t: 0.05, type: 'triangle', v: 0.2 }, { f: 2000, t: 0.08, type: 'triangle', v: 0.2 }],
    heart:   [{ f: 600, to: 1200, t: 0.15, type: 'triangle', v: 0.2 }],
    item:    [{ f: 523, t: 0.12, type: 'square', v: 0.1 }, { f: 659, t: 0.12, type: 'square', v: 0.1 },
              { f: 784, t: 0.12, type: 'square', v: 0.1 }, { f: 1047, t: 0.3, type: 'square', v: 0.1 }],
    door:    [{ f: 150, to: 300, t: 0.2, type: 'square', v: 0.15 }],
    text:    [{ f: 1000, t: 0.02, type: 'square', v: 0.04 }],
    stairs:  [{ f: 400, to: 100, t: 0.3, type: 'triangle', v: 0.2 }],
    gameover:[{ f: 440, to: 110, t: 1.0, type: 'triangle', v: 0.25 }],
    enemyShot:[{ f: 250, to: 500, t: 0.08, type: 'square', v: 0.06 }],
  };

  var ctx = null;
  var muted = false;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(ac) {
    var buf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function play(name) {
    if (muted || !SFX[name]) return;
    var ac = ensure();
    if (!ac) return;
    var t = ac.currentTime;
    SFX[name].forEach(function (s) {
      var gain = ac.createGain();
      gain.gain.setValueAtTime(s.v || 0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + s.t);
      gain.connect(ac.destination);
      var src;
      if (s.type === 'noise') {
        src = ac.createBufferSource();
        src.buffer = noiseBuffer(ac);
      } else {
        src = ac.createOscillator();
        src.type = s.type || 'square';
        src.frequency.setValueAtTime(s.f, t);
        if (s.to) src.frequency.exponentialRampToValueAtTime(s.to, t + s.t);
      }
      src.connect(gain);
      src.start(t);
      src.stop(t + s.t);
      t += s.t;
    });
  }

  return {
    SFX: SFX,
    play: play,
    unlock: ensure,
    toggleMute: function () { muted = !muted; return muted; },
  };
})();
