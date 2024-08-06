foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'UsernamePasswordCredentials',
    properties: [
        {
            class: 'String',
            name: 'username'
        },
        {
            class: 'String',
            name: 'password'
        }
    ]
});

foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'JWTCredentials',
    properties: [
        {
            class: 'String',
            name: 'token'
        }
    ]
});
