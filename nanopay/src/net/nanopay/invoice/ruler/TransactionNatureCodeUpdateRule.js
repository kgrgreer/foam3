/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.invoice.ruler',
  name: 'TransactionNatureCodeUpdateRule',

  documentation: `Extract NatureCode from invoice to the requestTxn`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'java.util.List',

    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionPayload',
    'foam.nanos.crunch.Capability',
    'net.nanopay.country.br.NatureCode',
    'net.nanopay.country.br.tx.NatureCodeLineItem',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.UnsupportedTransactionException',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Invoice invoice = (Invoice) obj;
        if ( invoice == null ) {
          throw new UnsupportedTransactionException("Invoice not found");
        }

        Transaction requestTxn = (Transaction) invoice.getRequestTransaction();

        DAO capablePayloadDAO = (DAO) invoice.getCapablePayloadDAO(x);
        List<CapabilityJunctionPayload> capablePayloadLst = (List<CapabilityJunctionPayload>) ((ArraySink) capablePayloadDAO.select(new ArraySink())).getArray();

        for ( CapabilityJunctionPayload capablePayload : capablePayloadLst ) {
          DAO capabilityDAO = (DAO) x.get("capabilityDAO");
          Capability cap = (Capability) capabilityDAO.find(capablePayload.getCapability());

          if ( cap instanceof NatureCode ) {
            NatureCodeLineItem lineItem = new NatureCodeLineItem();
            NatureCode natureCode = (NatureCode) cap;
            lineItem.setNatureCode(natureCode.getOperationType());

            requestTxn.addLineItems(new TransactionLineItem[] { lineItem });
            invoice.setRequestTransaction(requestTxn);
            break;
          }
        }
      `
    }
  ]
});
