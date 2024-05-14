/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistration',

  tableColumns: [ 'user', 'id' ],

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'subscription',
      view: { class: 'foam.u2.tag.TextArea', rows: 8, cols: 80 }
    }
  ]
});


foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'foam.nanos.auth.User',
  forwardName: 'pushRegistrations',
  targetModel: 'foam.nanos.notification.push.PushRegistration',
  inverseName: 'user',
  sourceProperty: {
    hidden: true
  },
  /*
  targetProperty: {
    view: { class: 'foam.u2.view.ReferenceView', placeholder: '--' },
    menuKeys: ['admin.groups']
  }
  */
});
