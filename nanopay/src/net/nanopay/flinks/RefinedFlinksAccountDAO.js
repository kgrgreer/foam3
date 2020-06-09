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
  package: 'net.nanopay.flinks',
  name: 'RefinedFlinksAccountDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for refining bank account fields in Flinks
      AccountsDetail response.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'net.nanopay.flinks.model.AccountWithDetailModel',
    'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'refinedFields',
      javaFactory: `
        return new String[] {
          "AccountNumber", "Balance", "Holder", "Title", "Transactions"
        };
      `,
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink refinedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject refined = refine(getX(), (FObject)obj);
              super.put(refined, sub);
            }
          };
          return ((ProxySink) super.select_(x, refinedSink, skip, limit, order, predicate)).getDelegate();
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'find_',
      javaCode: `
        FObject result = super.find_(x, id);

        if (result != null) {
          return refine(x, result);
        }
        return result;
      `
    },
    {
      name: 'refine',
      type: 'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
      args: [
        { type: 'Context',           name: 'x' },
        { type: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        FlinksAccountsDetailResponse result = (FlinksAccountsDetailResponse) obj.fclone();
        AccountWithDetailModel[] accounts = result.getAccounts();
        AuthService auth = (AuthService) x.get("auth");

        for (AccountWithDetailModel account : accounts) {
          for (String field : getRefinedFields()) {
            if (!auth.check(x, "AccountWithDetailModel.read." + field)) {
              reset(account, field);
            }
          }
        }
        return result;
      `
    },
    {
      name: 'reset',
      args: [
        { type: 'foam.core.FObject', name: 'obj' },
        { type: 'String', name: 'field' }
      ],
      javaCode: `
        PropertyInfo prop = (PropertyInfo) AccountWithDetailModel.getOwnClassInfo()
          .getAxiomByName(field);
        prop.set(obj, null);
      `
    }
  ]
});
