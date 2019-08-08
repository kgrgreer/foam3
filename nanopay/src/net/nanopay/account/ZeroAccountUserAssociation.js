foam.CLASS({
  package: 'net.nanopay.account',
  name: 'ZeroAccountUserAssociation',

  documentation: 'User associated with particular Transactions, from which to locate the Zero Account (Trust, Losses Account).  AlternaCITransaction -> nanopay -> TrustAccount for owner nanopay in currency CAD.',

  properties: [
    {
      documentation: 'Unique String such as spid-currency which maps to User which owns TrustAccount for example.',
      name: 'id',
      class: 'String',
      value: 'nanopay.*'
    },
   // {
   //    name: 'id',
   //    class: 'Long',
   // },
   // {
   //    name: 'sp',
   //    label: 'Service Provider',
   //    class: 'Reference',
   //    of: 'foam.nanos.auth.ServiceProvider',
   //    value: 'nanopay'
   //  },
   //  {
   //    name: 'currency',
   //    class: 'String',
   //    value: '*'
   //  }
    {
      name: 'user',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      value: 1
    }
  ]
});
