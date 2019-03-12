foam.ENUM({
  package: 'net.nanopay.integration',
  name: 'AccountingErrorCodes',

  documentation: 'Error codes for accounting integrations.',

  values: [
    { name: 'NOT_SIGNED_IN', label: 'User is not logged in.' },
    { name: 'TOKEN_EXPIRED', label: 'The access token has expired.' },
    { name: 'API_LIMIT', label: 'Please try again in a minute' },
    { name: 'ACCOUNTING_ERROR', label: 'An unexpected error has occurred.' },
    { name: 'INTERNAL_ERROR', label: 'Internal error has occurred.' },
    { name: 'MISSING_BANK', label: 'Bank account has not been linked to accounting software.' }
  ]
});
