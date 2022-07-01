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
    [ 'displayWidth', 80 ],
    [ 'view', 'foam.u2.view.MapView' ]
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

