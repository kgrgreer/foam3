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
  package: 'net.nanopay.tx.fee.predicate',
  name: 'HasLineItemPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Tests transaction for a certain line item.',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'Class of the line item to look for eg. NatureCodeLineItem.'
    },
    {
      class: 'String',
      name: 'propName'
    },
    {
      class: 'Object',
      name: 'propValue'
    },
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var transaction = (Transaction) obj;
        for ( var lineItem : transaction.getLineItems() ) {
          if ( getOf().isInstance(lineItem)
            && lineItem.getProperty(getPropName()).equals(getPropValue())
          ) {
            return true;
          }
        }
        return false;
      `,
      code: function(obj) {
        return obj.lineItems.some(
          lineItem =>
            net.nanopay.country.br.tx.NatureCodeLineItem.isInstance(lineItem)
            && lineItem[propName] === propValue
        );
      }
    }
  ]
});
