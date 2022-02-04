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
    [ 'displayWidth', 80 ]
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

foam.INTERFACE({
  package: 'foam.util',
  name: 'FluentSpec',

  methods: [
    {
      name: 'apply',
      args: [
        { name: 'fluent', type: 'foam.core.Fluent' }
      ]
    }
  ]
});

foam.CLASS({
  package: 'foam.util',
  name: 'AddFluentSpec',
  implements: ['foam.util.FluentSpec'],

  properties: [
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.add(this.spec);
    }
  ]
});


foam.CLASS({
  package: 'foam.util',
  name: 'RemoveFluentSpec',
  implements: ['foam.util.FluentSpec'],

  properties: [
    {
      class: 'String',
      name: 'reference'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.remove(this.reference);
    }
  ]
});

foam.CLASS({
  package: 'foam.util',
  name: 'AddBeforeFluentSpec',
  implements: ['foam.util.FluentSpec'],

  properties: [
    {
      class: 'String',
      name: 'reference'
    },
    {
      class: 'foam.util.FObjectSpec',
      name: 'spec'
    }
  ],

  methods: [
    function apply(fluent) {
      fluent.addBefore(this.reference, this.spec);
    }
  ]
});