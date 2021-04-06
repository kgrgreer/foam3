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
      color: '/*%WARNING1%*/ #865300',
      background: '/*%WARNING4%*/ #FFF3C1',    
    },
    { 
      name: 'SUBMITTED',
      label: 'Submitted',
      color: '/*%WARNING1%*/ #865300',
      background: '/*%WARNING4%*/ #FFF3C1'
    },
    { 
      name: 'ACTIVE',
      label: 'Active',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED',
    },
    { 
      name: 'DISABLED',
      label: 'Disabled',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #FFE9E7'
    },
    { 
      name: 'REVOKED',
      label: 'Revoked',
      color: '/*%GREY1%*/ #5A5A5A',
      background: '/*%GREY5%*/ #EEF0F2'
    },
  ]
});
