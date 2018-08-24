foam.CLASS({
    package: 'net.nanopay.fx',
    name: 'FXQuote',
    properties: [{
            class: 'foam.core.Date',
            name: 'expiryTime'
        },
        {
            class: 'String',
            name: 'id',
            documentation: 'Refers to the Quote ID'
        },
        {
            class: 'foam.core.Date',
            name: 'quoteDateTime'
        },
        {
            class: 'String',
            name: 'status'
        },
    ]
});
