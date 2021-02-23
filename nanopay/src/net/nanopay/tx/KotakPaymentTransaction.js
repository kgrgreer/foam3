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
  package: 'net.nanopay.tx',
  name: 'KotakPaymentTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Kotak Bank API call transaction.`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      class: 'UnitValue',
      name: 'settlementAmount'
    },
    {
      class: 'String',
      name: 'kotakMsgId'
    },
    {
      class: 'String',
      name: 'IFSCCode'
    },
    {
      class: 'String',
      name: 'chargeBorneBy',
      documentation: 'BEN (Beneficiary), OUR (Payer), SHA(Shared)'
    },
    {
      class: 'DateTime',
      name: 'sentDate',
      documentation: 'Business date when the transaction was sent to Kotak'
    },
    {
      class: 'String',
      name: 'paymentStatusCode'
    },
    {
      class: 'String',
      name: 'paymentStatusRem',
      documentation: 'Status Remarks which contains status description'
    },
    {
      class: 'String',
      name: 'queryReqId'
    },
    {
      class: 'String',
      name: 'queryStatusCode'
    },
    {
      class: 'String',
      name: 'queryStatusDesc'
    },
    {
      class: 'String',
      name: 'UTRNumber'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      value: 'PENDING',
      javaFactory: 'return TransactionStatus.PENDING;'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'initialStatus',
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
        if ( this.status == this.TransactionStatus.SENT ) {
          return [
            'choose status',
            ['DECLINED', 'DECLINED'],
            ['COMPLETED', 'COMPLETED']
          ];
        }
        if ( this.status == this.TransactionStatus.PENDING ) {
          return [
            'choose status',
            ['SENT', 'SENT'],
            ['COMPLETED', 'COMPLETED'],
            ['CANCELLED', 'CANCELLED']
          ];
        }
        return ['No status to choose'];
      }
    },
  ],

  methods: [
    {
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
      return false;
      `
    },
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ],
      javaCode: `
      super.limitedCopyFrom(other);
      setAmount(((KotakPaymentTransaction) other).getAmount());
      setLineItems(((KotakPaymentTransaction) other).getLineItems());
      setFxRate(((KotakPaymentTransaction) other).getFxRate());
      setSettlementAmount(((KotakPaymentTransaction) other).getSettlementAmount());
      setKotakMsgId(((KotakPaymentTransaction) other).getKotakMsgId());
      setIFSCCode(((KotakPaymentTransaction) other).getIFSCCode());
      setChargeBorneBy(((KotakPaymentTransaction) other).getChargeBorneBy());
      setSentDate(((KotakPaymentTransaction) other).getSentDate());
      setPaymentStatusCode(((KotakPaymentTransaction) other).getPaymentStatusCode());
      setQueryReqId(((KotakPaymentTransaction) other).getQueryReqId());
      setQueryStatusCode(((KotakPaymentTransaction) other).getQueryStatusCode());
      setQueryStatusDesc(((KotakPaymentTransaction) other).getQueryStatusDesc());
      setUTRNumber(((KotakPaymentTransaction) other).getUTRNumber());
      `
    },
    {
      name: 'getPurposeCode',
      type: 'String',
      javaCode: `
      for ( TransactionLineItem item : getLineItems() ) {
        if ( item instanceof KotakPaymentPurposeLineItem ) {
          return getPurposeText(((KotakPaymentPurposeLineItem) item).getPurposeCode());
        }
      }
      return"";
      `
    },
    {
      name: 'getAccountRelationship',
      type: 'String',
      javaCode: `
      for ( TransactionLineItem item : getLineItems() ) {
        if ( item instanceof KotakAccountRelationshipLineItem ) {
          return ((KotakAccountRelationshipLineItem) item).getAccountRelationship();
        }
      }
      return"";
      `
    },
    {
      name: 'getPurposeText',
      javaType: 'String',
      args: [
        {
          name: 'purposeCode',
          type: 'String',
        }
      ],
      javaCode: `
        switch (purposeCode) {
          case "P0306":
            return "PAYMENTS_FOR_TRAVEL";
    
          case "P1306":
            return "TAX_PAYMENTS_IN_INDIA";
    
          case "P0011":
            return "EMI_PAYMENTS_FOR_REPAYMENT_OF_LOANS";
    
          case "P0103":
            return "ADVANCE_AGAINST_EXPORTS";
    
          default:
            return "TRADE_TRANSACTION";
        }
      `
    },
  ]
});
