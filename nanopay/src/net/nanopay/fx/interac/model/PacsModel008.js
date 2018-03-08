foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel008',

  documentation: 'Pacs.008.001.06 Message for Interac',

  imports: [ 'transactionDAO'],

  javaImports: [
    'java.util.Date',
    //'net.nanopay.iso20022.FIToFICustomerCreditTransferV06',
    //'net.nanopay.iso20022.FIToFIPaymentStatusReportV09',
    'net.nanopay.iso20022.GroupHeader53',
    'net.nanopay.iso20022.CreditTransferTransaction25',
    'net.nanopay.iso20022.PaymentTransaction91',
    'net.nanopay.iso20022.OriginalGroupHeader13',
    'net.nanopay.tx.TransactionDAO',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction'
  ],

  properties:  [
    {
			class:  'String',
			name:  'MsgType',
			value: "pacs.008.001.06"
		},
		{
			class:  'FObjectProperty',
			name:  'FIToFICstmrCdtTrf',
			of:  'net.nanopay.iso20022.FIToFICustomerCreditTransferV06'
		}
	],

  methods: [
    {
      name: 'generatePacs002Msgby008Msg',

        javaReturns: 'net.nanopay.fx.interac.model.PacsModel002',
        javaCode: `
          PacsModel002 pacsModel002 = new PacsModel002();
          pacsModel002.setX(getX());

          OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

          orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());
          orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getFIToFICstmrCdtTrf().getGrpHdr().getCreDtTm());
          orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
          orgnlGrpInfAndSts.setOrgnlNbOfTxs(this.getFIToFICstmrCdtTrf().getGrpHdr().getNbOfTxs());
          orgnlGrpInfAndSts.setOrgnlCtrlSum(this.getFIToFICstmrCdtTrf().getGrpHdr().getCtrlSum());
          orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());

          DAO txnDAO     = (DAO) getX().get("transactionDAO");

          Transaction txn = (Transaction) txnDAO.find(Long.parseLong((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[0].getPmtId().getTxId()));
          String strStatus = "";

          if ( txn != null ) {
            strStatus = txn.getStatus();
          } else {
            // some error
          }

          PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();
          paymentTransaction91.setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));
          paymentTransaction91.setOrgnlEndToEndId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[0].getPmtId().getEndToEndId());
          paymentTransaction91.setOrgnlTxId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[0].getPmtId().getTxId());
          paymentTransaction91.setTxSts(strStatus);  // ACSP or ACSC

          orgnlGrpInfAndSts.setGrpSts(strStatus);

          GroupHeader53 grpHdr53 = new GroupHeader53();
          grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          grpHdr53.setCreDtTm(new Date());

          pacsModel002.setGrpHdr(grpHdr53);
          pacsModel002.setOrgnlGrpInfAndSts(orgnlGrpInfAndSts);
          pacsModel002.setTxInfAndSts(paymentTransaction91);

          return pacsModel002;
          `
      }
  ]

});
