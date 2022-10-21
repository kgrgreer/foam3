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

Object.defineProperty(
  Object.prototype,
  '$UID',
  {
    get: function() {
      if ( ! Object.hasOwnProperty.call(this, '$UID__') && ! Object.isFrozen(this) ) {
        Object.defineProperty(
          this,
          '$UID__',
          {value: foam.next$UID(), enumerable: false});
      }
      return this.$UID__;
    },
    enumerable: false
  }
);


/**
 * Creates a small library in the foam package. A LIB is a collection of
 * constants and static methods.
 * <pre>
foam.LIB({
  name: 'network',
  constants: {
    PORT: 4000
  },
  methods: [ function sendPacket() { ... }  ]
});
</pre>
Produces <code>foam.network</code>:
<pre>
console.log(foam.network.PORT); // outputs 4000
foam.network.sendPacket();
</pre>
 * @method LIB
 * @memberof module:foam
 */
foam.LIB = function LIB(model) {
  var root = foam.util.path(globalThis, model.name, true);

  if ( model.constants ) {
    foam.assert(
      typeof model.constants === 'object',
      'Constants must be a map.');

    if ( Array.isArray(model.constants) ) {
      for ( const v of model.constants ) {
        root[foam.String.constantize(v.name)] = v.value || v.factory.call(root);
      }
    } else {
      for ( var key in model.constants ) {
        var v = root[key] = model.constants[key];
        if ( foam.Object.isInstance(v) && v.class ) {
          v = foam.lookup(v.class).create(v);
        }
        root[key] = v;
      }
    }
  }

  if ( model.methods ) {
    foam.assert(Array.isArray(model.methods), 'Methods must be an array.');

    for ( i = 0 ; i < model.methods.length ; i++ ) {
      var m = model.methods[i];

      foam.assert(
        typeof m === 'object' || typeof m === 'function',
        'Methods must be a map of a function');

      foam.assert(
         typeof m !== 'object' || typeof m.code === 'function',
        'Methods must have a code key which is a function');

      var name = m.name || foam.Function.getName(m);
      foam.assert(name, 'Methods must be named with a non-empty string');

      root[name] = m.code || m;
    }
  }
};
