/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'SnapshotDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
insert below medusaconsensusdao on mediator
insert early on node or create two snapshot daos
put - keep track of dao key and object id (mediator)
cmd - 'new ledger' for nodes (nodes)
cmd - 'dump' - dump data? (mediator)
  `,
})
