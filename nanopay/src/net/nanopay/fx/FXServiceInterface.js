foam.INTERFACE({
    package: 'net.nanopay.fx',
    name: 'FXServiceInterface',
    methods: [
        {
            name: 'getFXRate',
            javaReturns: 'net.nanopay.fx.model.ExchangeRateQuote',
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
                    name: 'targetAmount',
                    javaType: 'double'
                },
                {
                    class: "String",
                    name: "fxDirection",
                    of: "net.nanopay.fx.model.FXDirection"
                },
                {
                    name: 'valueDate',
                    javaType: 'String'//TODO: investigate why java.util.dat can't be used here
                }
            ]
        },
        {
            name: 'acceptFXRate',
            javaReturns: 'net.nanopay.fx.model.FXAccepted',
            returns: 'Promise',
            javaThrows: ['java.lang.RuntimeException'],
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.AcceptFXRate'
                }
            ]
        },
        {
            name: 'submitFXDeal',
            documentation: 'To submit FX Deal',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.SubmitFXDeal'
                }
            ]
        },
        {
            name: 'getFXAccountBalance',
            documentation: 'Get FX holding account balance',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXHoldingAccountBalance',
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
            javaReturns: 'net.nanopay.fx.model.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.ConfirmFXDeal'
                }
            ]
        },
        {
            name: 'checkIncomingFundsStatus',
            documentation: 'Check if the coming funds has been credited to holding account',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXDeal',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.GetIncomingFundStatus'
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
            javaReturns: 'net.nanopay.fx.model.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.FXPayee'
                }
            ]
        },
        {
            name: 'updateFXPayee',
            documentation: 'To update a given FX payee\'s information',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.FXPayee'
                }
            ]
        },
        {
            name: 'deleteFXPayee',
            documentation: 'To delete a given payee',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.FXPayee'
                }
            ]
        },
        {
            name: 'getPayeeInfo',
            documentation: 'Get information for a given payee',
            returns: 'Promise',
            javaReturns: 'net.nanopay.fx.model.FXPayee',
            args: [
                {
                    name: 'request',
                    javaType: 'net.nanopay.fx.model.FXPayee'
                }
            ]
        }
    ]
});
