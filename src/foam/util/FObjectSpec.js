/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'FObjectSpec',
  extends: 'foam.core.FObjectProperty',

  documentation: `
    A Property which stores knowledge of what FObject to create
    rather than storing an instance of an FObject.
  `,

  axioms: [
    {
      installInClass: function(cls) {
        // ???: Should 'x' be used for class lookup instead of 'self'?
        cls.createFObject = function (spec, args, self, x) {
          const cls = self.__context__.lookup(spec.class);
          if ( ! cls ) {
            foam.assert(false, 'FObjectSpec specifies unknown class: ', spec.class);
            return cls;
          }
          return cls.create({ ...spec, ...(args || {}) }, x);
        }
      }
    }
  ],

  properties: [
    [
      'fromJSON',
      function fromJSON(value, ctx, prop, json) {
        /** Prevents specs from instantiating when loaded from JSON. **/
        return value;
      }
    ],
    [ 'adapt', function(_, spec, prop) {
      return foam.String.isInstance(spec) ? { class: spec } : spec ;
    } ],
    [ 'javaJSONParser', 'foam.lib.json.UnknownFObjectParser.instance()' ],
    [ 'displayWidth', 80 ],
    [ 'view', 'foam.u2.view.MapView' ]
  ],

  methods: [
    function installInProto(proto) {
      this.SUPER(proto);
      const self = this;
      Object.defineProperty(proto, self.name + '$create', {
        get: function getCreateFromFObjectSpec () {
          return (args, x) => {
            const spec = this[self.name];
            if ( ! spec ) {
              foam.assert(false, 'Called $create on empty FObjectSpec');
              return;
            }
            return self.cls_.createFObject(spec, args, this, x);
          }
        }
      })
    }
  ]
});


foam.CLASS({
  package: 'foam.util',
  name: 'FObjectSpecArray',
  extends: 'foam.core.FObjectArray',

  properties: [
    [
      'fromJSON',
      function fromJSON(value, ctx, prop, json) {
        /** Prevents specs from instantiating when loaded from JSON. **/
        return value;
      }
    ],
    [ 'adapt', function(_, specArray, prop) {
      return specArray.map(spec => foam.String.isInstance(spec) ? { class: spec } : spec );
    } ],
    [ 'javaJSONParser', 'foam.lib.json.UnknownFObjectParser.instance()' ],
    [ 'displayWidth', 80 ]
  ]
});
