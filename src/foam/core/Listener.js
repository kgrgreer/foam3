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

/**
  Listeners are high-level pre-bound event call-backs.
<pre>
  Ex.
  foam.CLASS({
    name: 'Sprinkler',
    listeners: [

      // short-form
      function onAlarm() { ... },

      // long-form
      {
        name: 'onClear',
        isFramed: true,
        code: function() { ... }
      }
    ]
  });
</pre>
  You might use the above onAlarm listener like this:
  alarm.ring.sub(sprinker.onAlarm);
<p>
  Notice, that normally JS methods forget which object they belong
  to so you would need to do something like:
    <pre>alarm.ring.sub(sprinker.onAlarm.bind(sprinkler));</pre>
  But listeners are pre-bound.
*/
// TODO(kgr): Add SUPER support.
foam.CLASS({
  package: 'foam.core',
  name: 'Listener',
  extends: 'foam.core.AbstractMethod',

  requires: [
    'foam.core.Argument',
  ],

  properties: [
    { class: 'Boolean', name: 'isFramed',   value: false },
    { class: 'Boolean', name: 'isMerged',   value: false },
    { class: 'Boolean', name: 'isIdled',    value: false },
    { class: 'Int',     name: 'delay',      value: 16, units: 'ms' },
    // legacy support, aliases to 'delay'
    { class: 'Int',     name: 'mergeDelay', value: 16,
      getter: function() { return this.delay; },
      setter: function(v) { this.delay = v; }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Argument',
      name: 'args',
      factory: function() {
        return [
          this.Argument.create({
            name: 'sub',
            type: 'Detachable'
          })
        ];
      }
    },
    {
      class:  'StringArray',
      name: 'on',
      adapt: function(_, v, prop) {
        if ( Array.isArray(v) )
          return v;
        return v.split(',');
      }
    }
  ],

  methods: [
    function installInProto(proto, superAxiom) {
      // This can happen when there's no js implementation of a listener.
      if ( ! this.code ) return;

      foam.assert(
        ! superAxiom ||
          foam.core.Listener.isInstance(superAxiom),
        'Attempt to override non-listener', this.name);

      var name     = this.name;
      var code     = this.override_(proto, foam.Function.setName(this.code, name), superAxiom);
      var isMerged = this.isMerged;
      var isIdled  = this.isIdled;
      var isFramed = this.isFramed;
      var delay    = this.delay;

      var obj = Object.defineProperty(proto, name, {
        get: function listenerGetter() {
          if ( this.cls_.prototype === this ) return code;

          if ( ! this.hasOwnPrivate_(name) ) {
            var self = this;
            var l = function() {
              // Don't deliver stale notifications after an object has been detached.
              if ( ! self.isDetached() ) return code.apply(self, arguments);
            };

            if ( isMerged ) {
              l = this.__context__.merged(l, delay);
            } else if ( isIdled ) {
              l = this.__context__.idled(l, delay);
            } else if ( isFramed ) {
              l = this.__context__.framed(l);
            }
            this.setPrivate_(name, l);
          }

          return this.getPrivate_(name);
        },
        configurable: true,
        enumerable: false
      });
    },
    function initObject(obj) {
      if ( this.on.length > 0 ) {
        var listener = obj[this.name];
        for ( var i = 0 ; i < this.on.length ; i++ ) {
          let o        = this.on[i].split('.');
          let objectOn = o.shift();
          let topic    = o;

          obj.onDetach(obj.sub.apply(obj, topic.concat(listener)));
        }
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Model',
  package: 'foam.core',
  name: 'ListenerModelRefine',
  properties: [
    {
      class: 'AxiomArray',
      of: 'Listener',
      name: 'listeners',
      adaptArrayElement: function(o) {
        if ( typeof o === 'function' ) {
          var name = foam.Function.getName(o);
          foam.assert(name, 'Listener must be named');
          return foam.core.Listener.create({name: name, code: o});
        }

        return foam.core.Listener.isInstance(o) ?
          o :
          foam.core.Listener.create(o) ;
      }
    }
  ]
});
