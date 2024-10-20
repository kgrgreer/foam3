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
<p>
  Methods are only installed on the prototype.
  If the method is overriding a method from a parent class,
  then SUPER support is added.

<p>
  Ex.
<pre>
  foam.CLASS({
    name: 'Parent',
    methods: [
      // short-form
      function sayHello() { console.log('hello'); },

      // long-form
      {
        name: 'sayGoodbye',
        code: function() { console.log('goodbye'); }
      }
    ]
  });

  // Create a subclass of Parent and override the 'sayHello' method.
  // The parent classes 'sayHello' methold is called with 'this.SUPER()'
  foam.CLASS({
    name: 'Child',
    extends: 'Parent',
    methods: [
      function sayHello() { this.SUPER(); console.log('world'); }
    ]
  });

  Child.create().sayHello();
  >> hello
  >> world
</pre>
*/
foam.CLASS({
  package: 'foam.core',
  name: 'AbstractMethod',

  properties: [
    {
      name: 'signature',
      postSet: function(_, signature) {
        // type name(aa) throws { javaCode }
        var i3 = signature.indexOf('{');
        if ( i3 != -1 ) {
          this.javaCode = signature.substring(i3+1, signature.lastIndexOf('}')).trim();
          signature = signature.substring(0, i3).trim();
        }

        var [meth, throws] = signature.split(' throws ');
        var i    = meth.indexOf(' ');
        var type = meth.substring(0, i);
        var sig  = meth.substring(i+1);
        var i2   = sig.indexOf('(');
        var name = sig.substring(0, i2);
        var args = sig.substring(i2+1, sig.length-1);

        this.name = name;
        this.args = args;
        this.type = type;

        if ( throws ) this.javaThrows = throws.split(',');
      }
    },
    { name: 'name', required: true },
    { name: 'code', required: false },
    'documentation',
    'flags',
    {
      name: 'type',
      value: 'Void'
    },
    {
      class: 'Boolean',
      name: 'async'
    },
    {
      class: 'Boolean',
      name: 'synchronized'
    },
    {
      class: 'Boolean',
      name: 'remote'
    },
    {
      name: 'args',
      factory: function() {
        if ( this.code )
          try {
            var bd = foam.Function.breakdown(this.code);
            return bd.args;
          } catch(e) {
            console.warn('Unable to parse args:', e);
          }
        return [];
      }
    }
  ],

  methods: [
    /**
      Decorate a method so that it can call the
      method it overrides with this.SUPER().
    */
    function override_(proto, method, superMethod) {
      if ( ! method ) {
        if ( this.name == 'toDisjunctiveNormalForm' ) {
          console.warn('Method code missing for', this.name);
        }
        return;
      }

      // Not using SUPER, so just return original method
      if ( method.toString().indexOf('SUPER') == -1 ) return method;

      var superMethod_ = proto.cls_.getSuperAxiomByName(this.name);
      var super_;

      if ( ! superMethod_ ) {
        var name = this.name;

        // This method itself provides a false-posistive because
        // it references SUPER(), so ignore.
        if ( name !== 'override_' ) {
          super_ = function() {
            console.warn(
                'Attempted to use SUPER() in',
                name, 'on', proto.cls_.id, 'but no parent method exists.');
          };

          // Generate warning now.
          super_();
        }
      } else {
        foam.assert(foam.core.AbstractMethod.isInstance(superMethod_),
          'Attempt to override non-method', this.name, 'on', proto.cls_.id);

        // Fetch the super method from the proto, as the super method axiom
        // may have decorated the code before installing it.
        super_ = proto.__proto__[this.name];
      }

      function SUPER() { return super_.apply(this, arguments); }

      var f = function superWrapper() {
        var oldSuper = this.SUPER;
        this.SUPER = SUPER;

        try {
          return method.apply(this, arguments);
        } finally {
          this.SUPER = oldSuper;
        }

        return ret;
      };

      foam.Function.setName(f, this.name);
      f.toString = function() { return method.toString(); };

      return f;
    },

    function createChildMethod_(child) {
      // Overwritten after foam.core.Argument is created.
      return child;
    },

    function installInClass(cls, superMethod, existingMethod) {
      var method = this;

      var parent = superMethod;
      if ( parent && foam.core.AbstractMethod.isInstance(parent) ) {
        method = parent.createChildMethod_(method);
      }

      cls.axiomMap_[method.name] = method;
    }
  ]
});


foam.CLASS({
  package: 'foam.core',
  name: 'Method',
  extends: 'foam.core.AbstractMethod',

  methods: [
    function installInProto(proto, superAxiom) {
      proto[this.name] = this.override_(proto, this.code, superAxiom);
    },

    function exportAs(obj) {
      var m = obj[this.name];
      /** Bind the method to 'this' when exported so that it still works. **/
      var f = function exportedMethod() { return m.apply(obj, arguments); };
      f.toString = () => { return 'exportedMethod ' + this.name + ' ' + m; };
      return f;
    }
  ]
});


foam.SCRIPT({
  package: 'foam.core',
  name: 'BootPhase2',
  code: function() {
    foam.boot.phase2();
  }
});
