/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.auth',
  name: 'AgentJunctionStatus',
  documentation: 'Describes the status between agent and entity on their junction.',
   values: [
    {
      name: 'ACTIVE',
      label: 'Active',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
      documentation: 'Junction is satisfied and agent may act as entity.'
    },
    {
      name: 'DISABLED',
      label: 'Disabled',
      color: '$destructive500',
      background: '$destructive50',
      documentation: 'Junction is unsatisfied disabling agent from acting as entity.'
    },
    {
      name: 'INVITED',
      label: 'Invited',
      color: '/*%WARNING1%*/ #865300',
      background: '/*%WARNING4%*/ #FFF3C1',
      documentation: 'The person has been invited to join the business.'
    }
  ]
});
