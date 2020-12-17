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
  name: 'RbcTransmissionHeader',

  documentation: `RBC File Transmission Headers`,

  javaImports: [
    'java.time.LocalDate'
  ],

  properties: [
    {
      name: 'networkGateway',
      class: 'String',
    },
    {
      name: 'networkGatewayClientId',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'toHeaderString',
      type: 'String',
      javaCode:
      `StringBuilder sb = new StringBuilder();
      sb.append(this.getNetworkGateway() + System.lineSeparator());
      sb.append("<Ng:NGRequest><Ng:NetworkGatewayClientID>");
      sb.append(this.getNetworkGatewayClientId());
      sb.append("</Ng:NetworkGatewayClientID></Ng:NGRequest>");
      sb.append(System.lineSeparator());
      return sb.toString();
      `
    },
  ]
});
