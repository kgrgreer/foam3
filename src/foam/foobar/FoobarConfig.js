/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'FoobarConfig',

  nodeRequires: [
    'path as path_'
  ],

  properties: [
    {
      class: 'Map',
      name: 'config'
    },
    {
      class: 'Map',
      name: 'values',
      factory: function () {
        return foam.Foobar.flattenObject(this.config);
      }
    },
    {
      class: 'Map',
      name: 'configFactories',
      factory: function () {
        const self = this;
        return {
          // config variables provided by tools/foobar.js
          'foobar.toolsDir': function () { return self.toolsDir },
          'project.srcDirs': function () { return self.srcDirs },

          // config variables implied by other variables
          'target.jrlDir': function (v) {
            return self.path_.join(v('target.runDir'), 'journals')
          }
        };
      }
    },
    'toolsDir',
    'srcDirs'
  ],

  methods: [
    function get(key) {
      if ( ! this.values.hasOwnProperty(key)
        && this.configFactories.hasOwnProperty(key)
      ) {
        this.values[key] = this.configFactories[key](this.get.bind(this));
      }
      return this.values[key];
    },
    function toObject() {
      const self = this;
      return new Proxy({}, {
        ownKeys: function () {
          return [...Object.keys(self.values),
            ...Object.keys(self.configFactories)];
        },
        getOwnPropertyDescriptor: function (_, key) {
          return {
            configurable: true,
            enumerable: true,
            value: self.get(key)
          };
        },
        get: function(_, key) {
          return self.get(key);
        }
      })
    },
    // move to foam.Object if this is needed elsewhere
    function deepCopyFrom(target, source) {
      for ( const key in source ) {
        if ( ! source.hasOwnProperty(key) ) continue;
        if ( target.hasOwnProperty(key)
          && foam.Object.isInstance(target[key])
          && foam.Object.isInstance(source[key])
        ) {
          this.deepCopyFrom(target[key], source[key])
          continue;
        }
        target[key] = source[key];
      }
    }
  ]
})
