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
    name: 'DUGRuleActionRefinement',
    refines: 'foam.nanos.dig.DUGRuleAction',

    methods: [
        {
            name: 'applyAction',
            javaCode: `
                var dugRule = (DUGRule) rule;
                agency.submit(x, new ContextAgent() {
                    @Override
                    public void execute(X x) {
                        HTTPSink sink = new HTTPSink(
                        dugRule.getUrl(), 
                        dugRule.evaluateBearerToken(), 
                        dugRule.getFormat(),
                        new foam.lib.AndPropertyPredicate(x, 
                            new foam.lib.PropertyPredicate[] {
                            new foam.lib.ExternalPropertyPredicate(),
                            new foam.lib.NetworkPropertyPredicate(), 
                            new foam.lib.PermissionedPropertyPredicate()}),
                        true
                        );
                        
                        sink.setX(x);
                        sink.put(obj, null);
                    }
                }, "DUG Rule (url: " + dugRule.getUrl() + " )");
            `
            }
      ]
})