foam.CLASS({
    package: 'foam.nanos.auth',
    name: 'JWTLoginServiceImpl',
    implements: [
        'foam.nanos.auth.openidconnect.JWTLoginService'
    ],
    imports: [
        'foam.nanos.auth.AuthService auth',
        'foam.dao.DAO localUserDAO',
        'foam.nanos.auth.UniqueUserService uniqueUserService',
    ],
    methods: [
        {
            name: 'login',
            javaCode: `
            return null;
            `
        }
    ]
})