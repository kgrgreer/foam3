/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'EasyDAORefinement',
  refines: 'foam.dao.EasyDAO',

  methods: [
    {
      name: 'getClusterDelegate',
      args: 'foam.dao.DAO delegate',
      type: 'foam.dao.DAO',
      javaCode: `
          if ( getSAF() ) {
            return new foam.nanos.medusa.sf.SFBroadcastDAO.Builder(getX())
            .setNSpec(getNSpec())
            .setDelegate(delegate)
            .build();
          } else {
            return new foam.nanos.medusa.MedusaAdapterDAO.Builder(getX())
              .setNSpec(getNSpec())
              .setDelegate(delegate)
              .build();
          }
      `
    }
  ]
})
