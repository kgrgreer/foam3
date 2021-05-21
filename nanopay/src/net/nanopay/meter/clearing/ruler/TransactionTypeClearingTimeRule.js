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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'TransactionTypeClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      label: 'Transaction Type',
      section: 'basicInfo'
    },
    {
      name: 'action',
      javaGetter: `
        return (x, obj, oldObj, ruler, rule, agency) -> {
          if ( getOf() != null && getOf().getObjClass().isInstance(obj) ) {
            incrClearingTime((Transaction) obj);
          }
        };
      `
    }
  ]
});
