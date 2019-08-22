foam.INTERFACE({
    package: 'net.nanopay.fx.afex',
    name: 'EnableAFEXService',

    methods: [
        {
            name: 'getEnableAFEX',
            type: 'net.nanopay.fx.afex.EnableAFEX',
            async: true,
            args: [
              {
                type: 'Context',
                name: 'x',
              },
            ]
        }
    ]
});