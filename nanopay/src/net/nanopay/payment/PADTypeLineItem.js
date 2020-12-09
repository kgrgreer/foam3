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
  package: 'net.nanopay.payment',
  name: 'PADTypeLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.payment.PADType',
      name: 'padType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.padTypeDAO,
          objToChoice: function(a) {
            return [a.id, a.description];
          },
          placeholder: 'Select PAD Type',
          // defaultValue: 700
        });
      },
    },
    {
      name: 'requireUserAction',
      class: 'Boolean',
      value: true
    },
    {
      name: 'id',
      hidden: true
    },
    {
      name: 'group',
      hidden: true
    },
    {
      name: 'type',
      hidden: true
    },
    {
      name: 'amount',
      hidden: true
    },
    {
      name: 'reversable',
      hidden: true
    },
    {
      name: 'note',
      hidden: true
    }
  ],

  javaImports: [
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public static void addEmptyLineTo(Transaction transaction) {
    addTo(transaction, 0l);
  }

  public static void addTo(Transaction transaction, long padType) {
    boolean set = false;
    for (TransactionLineItem lineItem : transaction.getLineItems()) {
      if ( lineItem instanceof PADTypeLineItem ) {
        ((PADTypeLineItem) lineItem).setPadType(padType);
        set = true;
      }
    }
    if ( ! set ) {
      PADTypeLineItem lineItem = new PADTypeLineItem();
      lineItem.setPadType(padType);
      transaction.addLineItems( new TransactionLineItem[] { lineItem } );
    }
  }

  public static PADType getPADTypeFrom(foam.core.X x, Transaction transaction) {
    PADTypeLineItem padTypeLineItem = null;
    for (TransactionLineItem lineItem : transaction.getLineItems()) {
      if ( lineItem instanceof PADTypeLineItem ) {
        padTypeLineItem = (PADTypeLineItem) lineItem;
        break;
      }
    }

    if ( padTypeLineItem != null ) {
      DAO dao = (DAO) x.get("padTypeDAO");
      return (PADType) dao.find(padTypeLineItem.getPadType());
    }

    return null;
  }
          `);
      }
    }
  ],
  methods: [
    {
      name: 'showLineItem',
      code: function() {
        return false;
      }
    }
  ]
});
