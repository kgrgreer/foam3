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
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcCIRecord',
  extends: 'net.nanopay.tx.rbc.iso20022file.RbcRecord',

  documentation: `RBC CI Transactions and ISO20022 Messages`,

  javaImports: [
    'net.nanopay.iso20022.ISO20022Util',
    'net.nanopay.iso20022.Pain00800102',
  ],

  properties: [
    {
      name: 'debitMsg',
      class: 'FObjectProperty',
      of: 'net.nanopay.iso20022.Pain00800102',
      transient: true
    },
  ],

  methods: [
    {
      name: 'toPain00800102XML',
      type: 'String',
      javaCode:`
      ISO20022Util util = new ISO20022Util();

      StringBuilder sb = new StringBuilder();
      if ( this.getTransmissionHeader() != null ) {
        sb.append(this.getTransmissionHeader().toHeaderString());
      } 
      sb.append(util.toXML(this.getDebitMsg()) + System.lineSeparator());
      return sb.toString();
      `
    },
  ]
});
