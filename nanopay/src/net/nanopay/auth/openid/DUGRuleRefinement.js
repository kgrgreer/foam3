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
    package: 'net.nanopay.auth.openid',
    name: 'DUGRuleRefinement',
    refines: 'foam.nanos.dig.DUGRule',

    requires: [
        'foam.box.HTTPAuthorizationType'
    ],

    javaImports: [
        'net.nanopay.auth.openid.OAuthProvider'
    ],

    methods: [
        {
            name: 'evaluateBearerToken',
            type: 'String',
            javaCode: `
            switch( getAuthType() ) {
            case OAUTH:
                var provider = (OAuthProvider) getX().get(getOAuthProvider());
                return provider.getAuthToken();
            case BEARER:
            default:
                return getBearerToken();
            }`
        }
    ],

    sections: [
        {
          name: 'authInfo',
          order: 20
        },
    ],

    properties: [
        {
            class: 'Enum',
            of: 'foam.box.HTTPAuthorizationType',
            name: 'authType',
            section: 'authInfo',
            order: 10,
        },
        {
            class: 'String',
            name: 'bearerToken',
            section: 'authInfo',
            order: 20,
            visibility: function(authType) {
                return authType == this.HTTPAuthorizationType.BEARER ?
                    foam.u2.DisplayMode.RW :
                    foam.u2.DisplayMode.HIDDEN;
            }
        },
        {
            class: 'Reference',
            of: 'net.nanopay.util.Tag',
            name: 'oAuthProvider',
            label: 'OAuth Provider',
            section: 'authInfo',
            order: 30,
            visibility: function(authType) {
                return authType == this.HTTPAuthorizationType.OAUTH ?
                    foam.u2.DisplayMode.RW :
                    foam.u2.DisplayMode.HIDDEN;
            },
            view: function(_, X) {
                return {
                    class: 'foam.u2.view.RichChoiceView',
                    sections: [
                        {
                            heading: 'Services',
                            dao: X.oauthProviderDAO
                        }
                    ]
                };
            },
        },
        {
            name: 'asyncAction',
            section: 'dugInfo',
            view: { class: 'foam.u2.tag.TextArea' },
            javaGetter: `
              return new DUGRuleAction();
            `
        },
    ]

 })