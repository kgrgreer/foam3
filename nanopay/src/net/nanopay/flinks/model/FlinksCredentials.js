foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'String',
      name: 'url',
      value: 'https://nanopay-api.private.fin.ag/v3'
    },
    {
      class: 'String',
      name: 'customerId',
      value: '8bc4718b-3780-46d0-82fd-b217535229f1',
      view: {
        class: 'foam.u2.view.PasswordView',
        onKey: true
      }
    }
  ]
});
