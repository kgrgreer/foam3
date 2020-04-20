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
