foam.CLASS({
    package: 'net.nanopay.fx.afex',
    name: 'EnableAFEXServiceImpl',

    javaImplements: [
        'net.nanopay.fx.afex.EnableAFEXService'
    ],

    methods: [
        {
            name: 'getEnableAFEX',
            type: 'net.nanopay.fx.afex.EnableAFEX',
            args: [
                {
                  type: 'Context',
                  name: 'x',
                },
              ],
            javaCode: `
                return (net.nanopay.fx.afex.EnableAFEX) getX().get("EnableAFEX");
            `
        }
    ]
});