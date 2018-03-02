foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'PacsModel008',

  documentation: 'Pacs Message for Interac',

  imports: [ 'transactionDAO'],

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
    'net.nanopay.iso20022.OriginalGroupInformation27',

    'net.nanopay.tx.TransactionDAO',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'GrpHdr',
      of: 'net.nanopay.iso20022.GroupHeader70'
    },
    {
			class: 'FObjectProperty',
			name: 'PmtTpInf',
			of: 'net.nanopay.iso20022.PaymentTypeInformation21'
		},
    {
			class: 'FObjectProperty',
			name: 'CdtTrfTxInf',
			of: 'net.nanopay.iso20022.CreditTransferTransaction25'
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
          orgnlGrpInfAndSts.setOrgnlMsgId(this.getGrpHdr().getMsgId());
          orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getGrpHdr().getCreDtTm());
                    System.out.println("dkfjkd: " + this.getGrpHdr().getCreDtTm());
          orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");

          DAO txnDAO     = (DAO) getX().get("transactionDAO");
          Transaction txn = (Transaction) txnDAO.find(Long.parseLong(this.getCdtTrfTxInf().getPmtId().getTxId()));
          String strStatus = "";

          if ( txn != null ) {
            strStatus = txn.getStatus();
          } else {
            // some error
          }

          PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();
          paymentTransaction91.setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));

          paymentTransaction91.setOrgnlEndToEndId(this.getCdtTrfTxInf().getPmtId().getEndToEndId());
          paymentTransaction91.setOrgnlTxId(this.getCdtTrfTxInf().getPmtId().getTxId());

          paymentTransaction91.setTxSts(strStatus);  // ACSP or ACSC
          orgnlGrpInfAndSts.setGrpSts(strStatus);
          pacsModel002.setGrpSts("ACSP");

          pacsModel002.setGrpHdr(this.getGrpHdr());
          pacsModel002.getGrpHdr().setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          pacsModel002.getGrpHdr().setCreDtTm(new Date());

          pacsModel002.setOrgnlGrpInfAndSts(orgnlGrpInfAndSts);
          pacsModel002.setTxInfAndSts(paymentTransaction91);

          return pacsModel002;
          `
      }
  ]

});
