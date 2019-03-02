foam.ENUM({
  package: 'net.nanopay.auth',
  name: 'AgentJunctionStatus',
  documentation: 'Describes the status between agent and entity on their junction.',
   values: [
    {
      name: 'ACTIVE',
      label: 'Active',
      documentation: 'Junction is satisfied and agent may act as entity.'
    },
    {
      name: 'DISABLED',
      label: 'Disabled',
      documentation: 'Junction is unsatisfied disabling agent from acting as entity.'
    },
    {
      name: 'INVITED',
      label: 'Invited',
      documentation: 'The person has been invited to join the business.'
    }
  ]
});
