FOAM_FILES([
  // service
  { name: 'net/nanopay/plaid/PlaidService' },
  { name: 'net/nanopay/plaid/ClientPlaidService' },

  // view
  { name: 'net/nanopay/plaid/ui/PlaidView', flags:['web']},

  // model
  { name: 'net/nanopay/plaid/model/PlaidPublicToken' },

  { name: 'net/nanopay/plaid/config/PlaidCredential' }

]);
