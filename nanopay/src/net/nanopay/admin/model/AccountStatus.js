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
  package: 'net.nanopay.admin.model',
  name: 'AccountStatus',

  documentation: `The base model for tracking the registration status of the account.`,

  values: [
    {
      name: 'PENDING',
      label: 'Pending',
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',    
    },
    { 
      name: 'SUBMITTED',
      label: 'Submitted',
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    { 
      name: 'ACTIVE',
      label: 'Active',
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    { 
      name: 'DISABLED',
      label: 'Disabled',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec'
    },
    { 
      name: 'REVOKED',
      label: 'Revoked',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec'
    },
  ]
});
