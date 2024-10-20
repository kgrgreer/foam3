/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.audio',
  name: 'Beep',

  documentation: 'Make a configurable beep sound.',

  imports: [
    'setTimeout',
    'window'
  ],

  properties: [
    [ 'gain', 1.0 ],
    {
      class: 'Int',
      name: 'duration',
      value: 100,
      units: 'ms'
    },
    {
      name: 'type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    { class: 'Float', name: 'frequency' , value: 220, units: 'Hz' },
    { class: 'Float', name: 'fmFrequency', label: 'FM Frequency', value: 0, units: 'Hz' },
    { class: 'Float', name: 'fmAmplitude', label: 'FM Amplitude', value: 20, units: '%' },
    {
      name: 'fmType',
      label: 'FM Type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    { class: 'Float', name: 'amFrequency', label: 'AM Frequency', value: 0, units: 'Hz' },
    { class: 'Float', name: 'amAmplitude', label: 'AM Amplitude', value: 20, units: '%' },
    {
      name: 'amType',
      label: 'AM Type',
      value: 'triangle',
      view: { class: 'foam.u2.view.ChoiceView', choices: [ 'sine', 'square', 'sawtooth', 'triangle' ] },
    },
    {
      class: 'Boolean',
      name: 'envelope',
      value: true
    },
    {
      class: 'Int',
      name: 'attack',
      value: 1,
      units: 'ms'
    },
    {
      class: 'Int',
      name: 'decay',
      value: 0,
      units: 'ms'
    },
    {
      class: 'Float',
      name: 'sustain',
      value: 100,
      units: '%'
    },
    {
      class: 'Int',
      name: 'release',
      value: 1,
      units: 'ms'
    }
  ],

  actions: [
    function play() {
      var cleanupAgents = [];
      var audio         = new this.window.AudioContext();
      var now           = audio.currentTime;
      var destination   = audio.destination;
      var o             = audio.createOscillator();
      var gain, fm, fmGain, am, amGain, env;

      function connect(src, destination) {
        src.connect(destination);
        cleanupAgents.push(() => src.disconnect(destination));
      }

      if ( this.gain !== 1 || this.amFrequency ) {
        gain = audio.createGain();
        gain.gain.value = this.gain;
        connect(gain, destination);
        destination = gain;
      }

      if ( this.envelope ) {
        env = audio.createGain();
        env.gain.cancelScheduledValues(0);
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(1, now+this.attack/1000);
        env.gain.linearRampToValueAtTime(this.sustain/100, now+(this.attack+this.decay)/1000);
 //       env.gain.linearRampToValueAtTime(this.sustain/100, now+(this.duration-this.release)/1000);
        env.gain.setValueAtTime(this.sustain/100, now+(this.duration-this.release)/1000);
        env.gain.linearRampToValueAtTime(0, now+this.duration/1000);
        connect(env, destination);
        destination = env;
      }

      o.frequency.value = this.frequency;
      o.type = this.type;
      connect(o, destination);

      if ( this.fmFrequency ) {
        fmGain = audio.createGain();
        fmGain.gain.value = this.fmAmplitude;
        fm = audio.createOscillator();
        cleanupAgents.push(() => fm.stop(0));
        fm.frequency.value = this.fmFrequency;
        fm.type = this.fmType;
        connect(fm, fmGain);
        connect(fmGain, o.frequency);
        fm.start();
      }

      if ( this.amFrequency ) {
        amGain = audio.createGain();
        amGain.gain.value = this.amAmplitude / 100;
        am = audio.createOscillator();
        cleanupAgents.push(() => am.stop(0));
        am.frequency.value = this.amFrequency;
        am.type = this.amType;
        connect(am, amGain);
        connect(amGain, gain.gain);
        am.start();
      }

      o.start(0);
      o.stop(now + this.duration/1000);

      // There should be a better way to know when to cleanup.
      this.setTimeout(function() {
        cleanupAgents.forEach(agent => agent());
        audio.close();
      }, this.duration+1000);
    }
  ]
});
