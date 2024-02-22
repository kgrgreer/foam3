/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.boot',
  name: 'NSpecAware',

  properties: [
    {
      name: 'nSpec',
      class: 'FObjectProperty',
      of: 'foam.nanos.boot.NSpec',
      transient: true
    }
  ]
});


foam.CLASS({
  package: 'foam.nanos.boot',
  name: 'EasyDAONSpecAwareRefinement',
  refines: 'foam.dao.EasyDAO',

  implements: [
    'foam.nanos.boot.NSpecAware'
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return this.nSpec && this.nSpec.name || (this.of && this.of.id);
      }
    }
  ]
});
