foam.ENUM({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRuleAction',
  documentation: 'Type of action to be specified for a  business rule.',

  values: [
    {
      name: 'ALLOW',
      label: 'Allow',
      documentation: 'Allows the operation to proceed.'
    },
    {
      name: 'RESTRICT',
      label: 'Restrict',
      documentation: 'Restricts the operation from proceeding.'
    },
    {
      name: 'NOTIFY',
      label: 'Notify',
      documentation: 'Sends a notification that the operaiton is happening.'
    },
    {
      name: 'APPROVE',
      label: 'Approve',
      documentation: 'Sends an approval requests for the given transaction.'
    }
  ]
});
