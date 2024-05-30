/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.push',
  name: 'PushRegistration',

  tableColumns: [ 'endpoint', 'user' ],

  ids: [ 'endpoint' ],

  properties: [
    {
      // primary key
      class: 'String',
      name: 'endpoint'
    },
    {
      class: 'String',
      name: 'key'
    },
    {
      class: 'String',
      name: 'auth'
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
