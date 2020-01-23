foam.CLASS({
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcCORecord',
  extends: 'net.nanopay.tx.rbc.iso20022file.RbcRecord',

  documentation: `RBC CO Transactions and ISO20022 Messages`,

  javaImports: [
    'net.nanopay.iso20022.ISO20022Util',
    'net.nanopay.iso20022.Pain00100103',
  ],

  properties: [
    {
      name: 'creditMsg',
      class: 'FObjectProperty',
      of: 'net.nanopay.iso20022.Pain00100103'
    },
  ],

  methods: [
    {
      name: 'toPain00100103XML',
      type: 'String',
      javaCode:`
      ISO20022Util util = new ISO20022Util();

      StringBuilder sb = new StringBuilder();
      if ( this.getTransmissionHeader() != null ) {
        sb.append(this.getTransmissionHeader().toHeaderString());
      } 
      sb.append(util.toXML(this.getCreditMsg()) + System.lineSeparator());
      return sb.toString();
      `
    }
  ]
});
