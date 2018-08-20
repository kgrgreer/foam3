foam.INTERFACE({
    package: 'net.nanopay.fx',
    name: 'FXServiceInterface',
    methods: [
        {
            name: 'getFXRate',
            javaReturns: 'net.nanopay.fx.ExchangeRateQuote',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'sourceCurrency',
                    javaType: 'String'
                },
                {
                    name: 'targetCurrency',
                    javaType: 'String'
                },
                {
                    name: 'sourceAmount',
                    javaType: 'double'
                },
                {
                    class: 'String',
                    name: 'fxDirection',
                    of: 'net.nanopay.fx.FXDirection'
                },
                {
                    name: 'valueDate',
                    javaType: 'String'// TODO: investigate why java.util.dat can't be used here
                }
            ]
        },
        {
            name: 'acceptFXRate',
            javaReturns: 'net.nanopay.fx.FXAccepted',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.AcceptFXRate'
                }
            ]
        },
        {
            name: 'submitFXDeal',
            documentation: 'To submit FX Deal',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.SubmitFXDeal'
                }
            ]
        },
        {
            name: 'getFXAccountBalance',
            documentation: 'Get FX holding account balance',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXHoldingAccountBalance',
            args: [
                {
                    name: 'fxAccountId',
                    javaType: 'String'
                }
            ]
        },
        {
            name: 'confirmFXDeal',
            documentation: 'To confirm booking has been effected',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.ConfirmFXDeal'
                }
            ]
        },
        {
            name: 'checkIncomingFundsStatus',
            documentation: 'Check if the coming funds has been credited to holding account',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.GetIncomingFundStatus'
                }
            ]
        },
        // {
        //   name: 'getFXAccountActivity',
        //   documentation: 'Returns ledger of the holding account',
        //   returns: 'Promise',
        //   javaReturns: 'net.nanopay.fx.model.GetFXAccountActivity',
        //   args: [
        //     {
        //       name: 'request',
        //       javaType: 'net.nanopay.fx.model.FXHoldingAccount'
        //     }
        //   ]
        // },
        {
            name: 'addFXPayee',
            documentation: 'To add a new FX payee',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.FXPayee'
                }
            ]
        },
        {
            name: 'updateFXPayee',
            documentation: 'To update a given FX payee\'s information',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.FXPayee'
                }
            ]
        },
        {
            name: 'deleteFXPayee',
            documentation: 'To delete a given payee',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.FXPayee'
                }
            ]
        },
        {
            name: 'getPayeeInfo',
            documentation: 'Get information for a given payee',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.FXPayee'
                }
            ]
        }
    ]
});
