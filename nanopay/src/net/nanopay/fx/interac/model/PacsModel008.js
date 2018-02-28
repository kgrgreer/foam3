foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel008',

  documentation: 'Pacs Message for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.iso20022.GroupHeader70',
    'net.nanopay.iso20022.CreditTransferTransaction25',
    'net.nanopay.iso20022.SettlementInstruction4',
    'net.nanopay.iso20022.PaymentTypeInformation21',
    'net.nanopay.iso20022.PostalAddress6',
    'net.nanopay.iso20022.PaymentTransaction91',
    'net.nanopay.iso20022.PaymentIdentification3',
    'net.nanopay.iso20022.OriginalGroupHeader13',
    'net.nanopay.iso20022.OriginalGroupInformation27'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'GrpHdr',
      of: 'net.nanopay.iso20022.GroupHeader70'
    },
    {
			class: 'FObjectProperty',
			name: 'CdtTrfTxInf',
			of: 'net.nanopay.iso20022.CreditTransferTransaction25'
		}
    /*{
			class: 'FObjectProperty',
			name: 'SttlmInf',
			of: 'net.nanopay.iso20022.SettlementInstruction4'
		},*/
    /*{
			class:  'FObjectProperty',
			name:  'PmtId',
			of:  'net.nanopay.iso20022.PaymentIdentification3'
		},*/
    /*{
			class: 'FObjectProperty',
			name: 'PmtId',
			of: 'net.nanopay.iso20022.PaymentTypeInformation21'
		},*/
    /*{
			class: 'FObjectProperty',
			name: 'PstlAdr',
			of: 'net.nanopay.iso20022.PostalAddress6'
		},*/
    /*{
			class:  'FObjectProperty',
			name:  'CdtTfTs',
			of:  'net.nanopay.iso20022.CreditTransferTransaction25'
		},*/
    /*{
			class:  'FObjectProperty',
			name:  'PmtId',
			of:  'net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5'
		}*/

  ],

  methods: [
    {
      name: 'generatePacs002Msgby008Msg',

        javaReturns: 'net.nanopay.fx.interac.model.PacsModel002',
        javaCode: `
          PacsModel002 pacsModel002 = new PacsModel002();
          pacsModel002.setX(getX());

          OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();
          orgnlGrpInfAndSts.setOrgnlMsgId(this.getGrpHdr().getMsgId());
          orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getGrpHdr().getCreDtTm());
          orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
          orgnlGrpInfAndSts.setGrpSts("ACSP");   // ACSP or ACSC
          System.out.println("dkfjkd: " + this.getGrpHdr().getCreDtTm());

          PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();
          paymentTransaction91.setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));

          paymentTransaction91.setOrgnlEndToEndId(this.getCdtTrfTxInf().getPmtId().getEndToEndId());
          paymentTransaction91.setOrgnlTxId(this.getCdtTrfTxInf().getPmtId().getTxId());

          paymentTransaction91.setTxSts("ACSP");  // ACSP or ACSC


          pacsModel002.setGrpHdr(this.getGrpHdr());
          pacsModel002.getGrpHdr().setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          pacsModel002.getGrpHdr().setCreDtTm(new Date());

          pacsModel002.setOrgnlGrpInfAndSts(orgnlGrpInfAndSts);
          pacsModel002.setTxInfAndSts(paymentTransaction91);

          //--pacsModel002.getTxInfAndSts().setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));
          //--pacsModel002.getTxInfAndSts().setOrgnlEndToEndId("OrgnlEndToEndId");

          //--OriginalGroupHeader3 ognlGrpHdr3 = new OriginalGroupHeader3();

          //--ognlGrpHdr3.setOrgnlMsgId(this.GroupHeader53.MsgId);
          pacsModel002.setGrpSts("ACSP");  // ACSP or ACSC

          return pacsModel002;
          `
      }
  ]

});
