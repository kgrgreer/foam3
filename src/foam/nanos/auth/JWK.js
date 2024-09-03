foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'JWK',
    ids: [
        'kid', 'origin'
    ],
    properties: [
        {
            class: 'String',
            name: 'kid'
        },
        {
            class: 'String',
            name: 'use'
        },
        {
            class: 'String',
            name: 'origin'
        },
        {
            class: 'Boolean',
            name: 'trusted',
            value: false
        }
    ]
});

foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'RSA256JWK',
    extends: 'foam.nanos.auth.JWK',
    properties: [
        {
            class: 'String',
            name: 'n'
        },
        {
            class: 'String',
            name: 'e'
        }
    ]
});
