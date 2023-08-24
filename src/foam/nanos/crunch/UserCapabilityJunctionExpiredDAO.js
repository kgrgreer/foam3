/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UserCapabilityJunctionExpiredDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  documentation: 'On find, set status to EXPIRED if expired.',

  methods: [
    {
      name: 'find_',
      javaCode: `
      UserCapabilityJunction ucj = (UserCapabilityJunction) getDelegate().find_(x, id);
      if ( ucj != null &&
           ucj.getStatus() == CapabilityJunctionStatus.GRANTED &&
           ucj.getExpiry() != null &&
           ! ucj.isInGracePeriod(x) &&
           ! ucj.isInRenewalPeriod(x) ) {
        ucj = (UserCapabilityJunction) ucj.fclone();
        ucj.reset();
        ucj.setStatus(CapabilityJunctionStatus.EXPIRED);
      }
      return ucj;
      `
    }
  ]
})
