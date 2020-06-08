/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.ENUM({
  package: 'net.nanopay.accounting',
  name: 'AccountingErrorCodes',

  documentation: 'Error codes for accounting integrations.',

  values: [
    { name: 'NOT_SIGNED_IN', label: 'User is not logged in.' },
    { name: 'TOKEN_EXPIRED', label: 'The access token has expired.' },
    { name: 'API_LIMIT', label: 'Please try again in a minute' },
    { name: 'ACCOUNTING_ERROR', label: 'An unexpected error has occurred.' },
    { name: 'INTERNAL_ERROR', label: 'Internal error has occurred.' },
    { name: 'MISSING_BANK', label: 'Bank account has not been linked to accounting software.' },
    { name: 'INVALID_ORGANIZATION', label: 'User is not signed into the right organization.' }
  ]
});
