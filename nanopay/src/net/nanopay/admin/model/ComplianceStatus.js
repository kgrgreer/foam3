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
  name: 'ComplianceStatus',

  documentation: 'Status on compliance',

  values: [
    { 
      name: 'NOTREQUESTED', 
      label: 'Not Requested',
      color: '/*%GREY1%*/ #5A5A5A',
      background: '/*%GREY5%*/ #EEF0F2'
    },
    { 
      name: 'REQUESTED', 
      label: 'Requested',
      color: '/*%WARNING1%*/ #865300',
      background: '/*%WARNING4%*/ #FFF3C1'
    },
    { 
      name: 'PASSED',    
      label: 'Passed',
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED'
    },
    { 
      name: 'FAILED',    
      label: 'Failed',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #FFE9E7'
    }
  ]
});
