foam.CLASS({
    package: 'net.nanopay.fx',
    name: 'FXDeal',
    properties: [{
            class: 'String',
            name: 'quoteId'
        },
        {
            class: 'String',
            name: 'id'
        },
        {
            class: 'String',
            name: 'fxPaymentId'
        },
        {
            class: 'foam.core.Enum',
            name: 'FXDirection',
            of: 'net.nanopay.fx.FXDirection',
            required: false
        },
        {
            class: 'foam.core.Float',
            name: 'Fee',
            required: false
        },
        {
            class: 'foam.core.Float',
            name: 'FXAmount',
            required: false
        },
        {
            class: 'foam.core.String',
            name: 'FXCurrencyID'
        },
        {
            class: 'foam.core.String',
            name: 'InternalNotes'
        },
        {
            class: 'foam.core.String',
            name: 'NotesToPayee'
        },
        {
            class: 'foam.core.String',
            name: 'PaymentMethod'
        },
        {
            class: 'foam.core.Int',
            name: 'PaymentSequenceNo',
            required: false
        },
        {
            class: 'foam.core.Int',
            name: 'FXDealStatus',
            required: false
        },
        {
            class: 'foam.core.Float',
            name: 'Rate',
            required: false
        },
        {
            class: 'foam.core.Float',
            name: 'SettlementAmount',
            required: false
        },
        {
            class: 'foam.core.String',
            name: 'SettlementCurrencyID'
        },
        {
            class: 'foam.core.Float',
            name: 'TotalSettlementAmount',
            required: false
        },
        {
            class: 'FObjectProperty',
            name: 'payee',
            of: 'net.nanopay.fx.FXPayee'
        }
    ]
});
