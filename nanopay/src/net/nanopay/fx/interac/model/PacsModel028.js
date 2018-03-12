foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel028',

  documentation: 'Pacs Message for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.iso20022.GroupHeader53',
    'net.nanopay.iso20022.OriginalGroupHeader13',
    'net.nanopay.iso20022.FIToFIPaymentStatusReportV09'
  ],

  properties:  [
    {
			class:  'String',
			name:  'MsgType',
			value: "pacs.028.001.01"
		},
    {
      class:  'FObjectProperty',
      name:  'FIToFIPmtStsReq',
      of:  'net.nanopay.iso20022.FIToFIPaymentStatusRequestV01',
      required:  false
    }
  ],

  methods: [
      {
        name: 'generatePacs002Msgby028Msg',

          javaReturns: 'net.nanopay.fx.interac.model.PacsModel002',
          javaCode: `
            PacsModel002 pacsModel002 = new PacsModel002();
            pacsModel002.setX(getX());

            GroupHeader53 grpHdr53 = new GroupHeader53();
            grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
            grpHdr53.setCreDtTm(new Date());

            pacsModel002.setGrpHdr(grpHdr53);

            OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();
            orgnlGrpInfAndSts.setOrgnlMsgId((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[0].getOrgnlMsgId());
            orgnlGrpInfAndSts.setOrgnlCreDtTm((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[0].getOrgnlCreDtTm());
            orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
            orgnlGrpInfAndSts.setGrpSts("ACSP");   // ACSP or ACSC

            pacsModel002.setOrgnlGrpInfAndSts(orgnlGrpInfAndSts);

            return pacsModel002;
            `
        }
  ]
});
