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

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'NatureCode',
  extends: 'foam.nanos.crunch.Capability',

  messages: [
    { name: 'ENTER_NATURE_CODE', message: 'Please enter a Nature Code.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'operationType',
      validateObj: function(code) {
        var regex = /^[0-9]{5}$/;
        if ( ! regex.test(code) && group != null) {
          return this.ENTER_NATURE_CODE;
        }
      }
    },
    {
      class: 'String',
      name: 'payerType',
      documentation: '00 - Physical person domiciled in the country, 09 - Non-financial company - private'
    },
    {
      class: 'String',
      name: 'approvalType'
    },
    {
      class: 'String',
      name: 'payeeType',
      documentation: '02 - Physical person domiciled abroad, 05 - Non-financial company - private, 90 - No payer/recipient'
    },
    {
      class: 'String',
      name: 'groupCode',
      value: '90',
      documentation: '90 - others'
    }
  ],

  methods: [
    {
      name: 'getCode',
      type: 'String',
      code: function() {
        return operationType.concat(payerType, approvalType, payeeType, groupCode);
      },
      javaCode: `
        StringBuilder str = new StringBuilder();
        str.append(getOperationType());
        str.append(getPayerType());
        str.append(getApprovalType());
        str.append(getPayeeType());
        str.append(getGroupCode());
        return str.toString();
      `
    }
  ]
});
