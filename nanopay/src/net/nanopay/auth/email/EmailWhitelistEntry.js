foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailWhitelistEntry',
  plural: 'whitelisted email addresses',

  documentation: `An object in the email whitelist.`,

  properties: [
    {
      class: 'EMail',
      name: 'id',
      label: 'Email address'
    }
  ]
});
