/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang',
  name: 'SinkProperty',
  extends: 'FObjectProperty',

  flags: [],

  properties: [
    {
      name: 'type',
      value: 'foam.dao.Sink'
    },
    ['javaJSONParser', 'foam.lib.json.FObjectParser.instance()'],
    {
      name: 'view',
      value: { class: 'foam.u2.view.FObjectView' }
    }
  ],

  documentation: 'Property for Sink values.'
});
