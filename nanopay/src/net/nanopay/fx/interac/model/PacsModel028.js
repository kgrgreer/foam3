foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel028',

  documentation: 'Pacs Message for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.iso20022.GroupHeader70',
    'net.nanopay.iso20022.OriginalGroupInformation27',
    'net.nanopay.iso20022.OriginalGroupHeader13'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'GrpHdr',
      of: 'net.nanopay.iso20022.GroupHeader70'
    },
    {
			class: 'FObjectProperty',
			name: 'OrgnlGrpInf',
			of: 'net.nanopay.iso20022.OriginalGroupInformation27'
		}
  ],

  methods: [
      {
        name: 'generatePacs002Msgby028Msg',

          javaReturns: 'net.nanopay.fx.interac.model.PacsModel002',
          javaCode: `
            PacsModel002 pacsModel002 = new PacsModel002();
            pacsModel002.setX(getX());

            OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();
            orgnlGrpInfAndSts.setOrgnlMsgId(this.getOrgnlGrpInf().getOrgnlMsgId());
            orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getOrgnlGrpInf().getOrgnlCreDtTm());
            orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");

            pacsModel002.setGrpHdr(this.getGrpHdr());
            pacsModel002.getGrpHdr().setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
            pacsModel002.getGrpHdr().setCreDtTm(new Date());

            pacsModel002.setOrgnlGrpInfAndSts(orgnlGrpInfAndSts);
            pacsModel002.setGrpSts("ACSP");  // ACSP or ACSC

            return pacsModel002;
            `
        }
  ]
});
