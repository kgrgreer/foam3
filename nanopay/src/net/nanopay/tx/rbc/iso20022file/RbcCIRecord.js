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
