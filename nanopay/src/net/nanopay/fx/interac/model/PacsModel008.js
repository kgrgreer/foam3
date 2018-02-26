foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel008',

  documentation: 'Pacs Message for Interac',

  javaImports: [
    'java.util.Date',
    'net.nanopay.iso20022.GroupHeader53',
    'net.nanopay.iso20022.SettlementInstruction4',
    'net.nanopay.iso20022.PaymentTypeInformation21',
    'net.nanopay.iso20022.PostalAddress6',
    'net.nanopay.iso20022.PaymentTransaction91'
    //'net.nanopay.iso20022.OriginalGroupHeader3'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'GrpHdr',
      of: 'net.nanopay.iso20022.GroupHeader53'
    },
    // {
		// 	class: 'FObjectProperty',
		// 	name: 'OrgnlGrpInfAndSts',
		// 	of: 'net.nanopay.iso20022.OriginalGroupHeader3'
		// },
    {
			class: 'FObjectProperty',
			name: 'SttlmInf',
			of: 'net.nanopay.iso20022.SettlementInstruction4'
		},
    {
			class: 'FObjectProperty',
			name: 'PmtId',
			of: 'net.nanopay.iso20022.PaymentTypeInformation21'
		},
    {
			class: 'FObjectProperty',
			name: 'PstlAdr',
			of: 'net.nanopay.iso20022.PostalAddress6'
		},
    {
			class:  'FObjectProperty',
			name:  'TxInfAndSts',
			of:  'net.nanopay.iso20022.PaymentTransaction91'
		},
    {
			class:  'FObjectProperty',
			name:  'CdtTrfTxInf',
			of:  'net.nanopay.iso20022.PaymentIdentification3'
		},
    {
			class:  'FObjectProperty',
			name:  'CdtTfTs',
			of:  'net.nanopay.iso20022.CreditTransferTransaction25'
		},
    /*{
			class:  'FObjectProperty',
			name:  'PmtId',
			of:  'net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5'
		}*/

  ],

  methods: [
    {
      name: 'generatePacs002Msg',


        javaReturns: 'net.nanopay.fx.interac.model.PacsModel002',
        javaCode: `
          PacsModel002 pacsModel002 = new PacsModel002();
          pacsModel002.setX(getX());

          pacsModel002.setGrpHdr(this.getGrpHdr());
          pacsModel002.getGrpHdr().setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          pacsModel002.getTxInfAndSts().setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));
          pacsModel002.getTxInfAndSts().setOrgnlEndToEndId("OrgnlEndToEndId");

          //OriginalGroupHeader3 ognlGrpHdr3 = new OriginalGroupHeader3();

          //ognlGrpHdr3.setOrgnlMsgId(this.GroupHeader53.MsgId);
          pacsModel002.setGrpSts("ACSP");  // ACSP or ACSC

          return pacsModel002;
          `
      }
  ]

});
