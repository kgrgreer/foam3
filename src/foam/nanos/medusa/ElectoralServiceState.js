/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.medusa',
  name: 'ElectoralServiceState',
  
  documentation: `
        Voting state of a node/instance in a cluster.
      `,
  
  values: [
    {
      documentation: 'Medusa primary mediator has been abandoned and new election needs to be called.',
      name: 'DISMISSED',
      label: 'Dismissed'
    },
    {
      documentation: 'State of the mediator running the election.',
      name: 'ELECTION',
      label: 'Election'
    },
    {
      documentation: 'State of a mediator voting in an election.',
      name: 'VOTING',
      label: 'Voting'
    },
    {
      documentation: 'Mediators have decided on a primary and election is complete.',
      name: 'IN_SESSION',
      label: 'In-Session'
    }
  ]
});

