/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Hold Ascendant FX specific properties`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'java.util.Arrays',
    'java.util.ArrayList',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.fx.ascendantfx.AscendantFXHTMLGenerator',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteRequest',
    'net.nanopay.fx.ascendantfx.model.AcceptQuoteResult',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXService',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        if ( this.status == this.TransactionStatus.COMPLETED ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['COMPLETED', 'COMPLETED'],
            ['DECLINED', 'DECLINED']
          ];
        }
        if ( this.status == this.TransactionStatus.SENT ) {
                  return [
                    'choose status',
                    ['COMPLETED', 'COMPLETED'],
                    ['DECLINED', 'DECLINED']
                  ];
                }
       return ['No status to choose'];
      }
    }
  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      javaCode: `
      //Get ascendantfx service
      FXService fxService = (FXService) x.get("ascendantFXService");
      try{
        if( fxService.acceptFXRate(getFxQuoteId(), getPayerId()) ) setAccepted(true);
      }catch(Throwable t) {
        ((Logger) x.get(Logger.class)).error("Error sending Accept Quote Request to AscendantFX.", t);
      }

      `
    },
    {
      name: 'executeAfterPut',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaCode: `
        super.executeAfterPut(x, oldTxn);

        long invoiceId = this.getInvoiceId();

        if ( invoiceId == 0 ) {
          return;
        }

        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
        Invoice invoice = (Invoice) invoiceDAO.find(invoiceId).fclone();

        if ( invoice == null ) {
          throw new RuntimeException(String.format("Invoice with id %d not found. Could not save AFX transaction confirmation PDF.", invoiceId));
        }

        // Generate a transaction confirmation PDF and store it as an attachment
        // on the invoice associated with this transaction.
        File pdf = (new AscendantFXHTMLGenerator()).generateTransactionConfirmationPDF(x, this);
        invoice.setAFXConfirmationPDF(pdf);
        invoiceDAO.put(invoice);
      `
    }
  ]
});
