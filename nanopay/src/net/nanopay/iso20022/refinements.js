foam.CLASS({
  refines: 'net.nanopay.iso20022.ISODate',

  properties: [
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DD
      // pads month and date with leading zeros
      var year = value.getUTCFullYear();
      var month = value.getUTCMonth() + 1;
      month = ('00' + month).slice(-2);

      var date = value.getUTCDate();
      date = ('00' + date).slice(-2);

      return year + '-' + month + '-' + date;
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.ISODateTime',

  properties: [
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function formatDate(value) {
      // returns date in the following format: YYYY-MM-DDThh:mm:ss.sss+/-hh:mm
      // pads hour and minute in offset with leading zeros
      var isoString = value.toISOString();
      isoString = isoString.substring(0, isoString.length - 1);

      var timezoneOffset = value.getTimezoneOffset();
      if ( timezoneOffset < 0 ) {
        timezoneOffset *= -1
        isoString += '+';
      } else {
        isoString += '-';
      }

      // calculate hour and minute offset
      var hourOffset = ('00' + (Math.trunc(timezoneOffset / 60))).slice(-2);
      timezoneOffset = ('00' + (timezoneOffset - ( hourOffset * 60 ))).slice(-2);

      isoString += hourOffset + ':' + timezoneOffset;
      return isoString;
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.ISOTime',

  properties: [
    {
      name: 'toJSON',
      value: function toJSON(value, _) {
        return this.formatDate(value);
      }
    },
    {
      name: 'toXML',
      value: function toXML(value, _) {
        return this.formatDate(value);
      }
    }
  ],

  methods: [
    function formatDate(value) {
      // returns date in the following format: HH:mm:ss.sssZ
      // pads all values with leading zeros
      var hours = value.getUTCHours();
      hours = ('00' + hours).slice(-2);

      var minutes = value.getUTCMinutes();
      minutes = ('00' + minutes).slice(-2);

      var seconds = value.getUTCSeconds();
      seconds = ('00' + seconds).slice(-2);

      var milliseconds = value.getUTCMilliseconds();
      milliseconds = ('000' + milliseconds).slice(-3);

      return hours + ':' + minutes + ':' + seconds + '.' + milliseconds + 'Z';
    }
  ]
});

foam.CLASS({
  refines: 'net.nanopay.iso20022.Pacs00800106',

  javaImports: [
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.Date',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'generatePacs002Msgby008Msg',

        javaReturns: 'net.nanopay.iso20022.Pacs00200109',
        javaCode: `
          Pacs00200109 pacs00200109 = new Pacs00200109();
          pacs00200109.setX(getX());

          FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

          GroupHeader53 grpHdr53 = new GroupHeader53();
          grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
          grpHdr53.setCreDtTm(new Date());

          int length_ = this.getFIToFICstmrCdtTrf().getCdtTrfTxInf().length;
          pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
          pacs00200109.getFIToFIPmtStsRpt().setTxInfAndSts(new PaymentTransaction91[length_]);
          pacs00200109.getFIToFIPmtStsRpt().setOrgnlGrpInfAndSts(new OriginalGroupHeader13[length_]);
          pacs00200109.getFIToFIPmtStsRpt().setGrpHdr(grpHdr53);

          DAO txnDAO = (DAO) getX().get("transactionDAO");

          for ( int i = 0 ; i < length_ ; i++ ) {
            Transaction txn = (Transaction) txnDAO.find(Long.parseLong((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getTxId()));
            String strStatus = "";

            if ( txn != null ) {
              strStatus = ( (TransactionStatus) txn.getStatus() ).getLabel();
            }

            PaymentTransaction91 paymentTransaction91 = new PaymentTransaction91();

            paymentTransaction91.setStsId(java.util.UUID.randomUUID().toString().replace("-", ""));
            paymentTransaction91.setOrgnlEndToEndId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getEndToEndId());
            paymentTransaction91.setOrgnlTxId((this.getFIToFICstmrCdtTrf().getCdtTrfTxInf())[i].getPmtId().getTxId());
            paymentTransaction91.setTxSts(strStatus);  // ACSP or ACSC

            pacs00200109.getFIToFIPmtStsRpt().getTxInfAndSts()[i] = paymentTransaction91;

            OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

            orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());
            orgnlGrpInfAndSts.setOrgnlCreDtTm(this.getFIToFICstmrCdtTrf().getGrpHdr().getCreDtTm());
            orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
            orgnlGrpInfAndSts.setOrgnlNbOfTxs(this.getFIToFICstmrCdtTrf().getGrpHdr().getNbOfTxs());
            orgnlGrpInfAndSts.setOrgnlCtrlSum(this.getFIToFICstmrCdtTrf().getGrpHdr().getCtrlSum());
            orgnlGrpInfAndSts.setOrgnlMsgId(this.getFIToFICstmrCdtTrf().getGrpHdr().getMsgId());
            orgnlGrpInfAndSts.setGrpSts(strStatus);

            pacs00200109.getFIToFIPmtStsRpt().getOrgnlGrpInfAndSts()[i] = orgnlGrpInfAndSts;
          }

          return pacs00200109;
          `
      }
  ]

});


foam.CLASS({
  refines: 'net.nanopay.iso20022.Pacs02800101',

  javaImports: [
    'net.nanopay.tx.TransactionDAO',
    'net.nanopay.tx.model.Transaction',
    'java.util.Date',
    'foam.dao.DAO'
  ],

  methods: [
      {
        name: 'generatePacs002Msgby028Msg',

          javaReturns: 'net.nanopay.iso20022.Pacs00200109',
          javaCode: `
            Pacs00200109 pacs00200109 = new Pacs00200109();
            pacs00200109.setX(getX());

            FIToFIPaymentStatusReportV09 fIToFIPmtStsRpt = new FIToFIPaymentStatusReportV09();

            GroupHeader53 grpHdr53 = new GroupHeader53();
            grpHdr53.setMsgId(java.util.UUID.randomUUID().toString().replace("-", ""));
            grpHdr53.setCreDtTm(new Date());

            int length_ = this.getFIToFIPmtStsReq().getOrgnlGrpInf().length;
            pacs00200109.setFIToFIPmtStsRpt(fIToFIPmtStsRpt);
            pacs00200109.getFIToFIPmtStsRpt().setOrgnlGrpInfAndSts(new OriginalGroupHeader13[length_]);
            pacs00200109.getFIToFIPmtStsRpt().setGrpHdr(grpHdr53);

            DAO txnDAO = (DAO) getX().get("transactionDAO");

            for ( int i = 0 ; i < length_ ; i++ ) {
              OriginalGroupHeader13 orgnlGrpInfAndSts = new OriginalGroupHeader13();

              Transaction txn = (Transaction) txnDAO.find((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId());
              String strStatus = "";

              if ( txn != null ) {
                strStatus = txn.getStatus();
              }

              orgnlGrpInfAndSts.setOrgnlMsgId((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlMsgId());
              orgnlGrpInfAndSts.setOrgnlCreDtTm((this.getFIToFIPmtStsReq().getOrgnlGrpInf())[i].getOrgnlCreDtTm());
              orgnlGrpInfAndSts.setOrgnlMsgNmId("Pacs.008.001.06");
              orgnlGrpInfAndSts.setGrpSts(strStatus);   // ACSP or ACSC
              pacs00200109.getFIToFIPmtStsRpt().getOrgnlGrpInfAndSts()[i] = orgnlGrpInfAndSts;
            }

            return pacs00200109;
            `
        }
  ]
});
