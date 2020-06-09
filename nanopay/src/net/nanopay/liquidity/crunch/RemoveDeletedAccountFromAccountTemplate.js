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
    package: 'net.nanopay.liquidity.crunch',
    name: 'RemoveDeletedAccountFromAccountTemplate',
    extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  
  
    implements: ['foam.nanos.ruler.RuleAction'],
  
    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.ArraySink',
      'foam.dao.DAO',
      'foam.nanos.auth.LifecycleAware',
      'foam.nanos.logger.Logger',
      'java.util.List',
      'java.util.Map',
      'net.nanopay.account.Account'
    ],
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
  
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              if ( ((LifecycleAware) obj).getLifecycleState() != foam.nanos.auth.LifecycleState.DELETED ) return;

              Logger logger = (Logger) x.get("logger");
              String accountId = String.valueOf(((Account) obj).getId());

              DAO accountTemplateDAO = (DAO) x.get("accountTemplateDAO");
              DAO capabilityAccountTemplateDAO = (DAO) x.get("capabilityAccountTemplateDAO");

              List<AccountTemplate> accountTemplates = ((ArraySink) accountTemplateDAO.select(new ArraySink())).getArray();
              List<CapabilityAccountTemplate> capabilityAccountTemplates = ((ArraySink) capabilityAccountTemplateDAO.select(new ArraySink())).getArray();
              
              Map<String, AccountData> accountTemplateMap;
              for ( AccountTemplate template : accountTemplates ) {
                accountTemplateMap = template.getAccounts();
                if ( accountTemplateMap.remove(accountId) == null ) continue;
                if ( accountTemplateMap.size() == 0 ) {
                  accountTemplateDAO.remove(template);
                  logger.info("Account Template " + template.getId() + " has been removed due to having an empty map");
                } else {
                  template.setAccounts(accountTemplateMap);
                  accountTemplateDAO.put(template);
                }
              }
              logger.info("All references to the deleted account " + accountId + " have been removed from accountTemplates");

              Map<String, CapabilityAccountData> capabilityAccountTemplateMap;
              for ( CapabilityAccountTemplate template : capabilityAccountTemplates ) {
                capabilityAccountTemplateMap = template.getAccounts();
                if ( capabilityAccountTemplateMap.remove(accountId) == null ) continue;
                if ( capabilityAccountTemplateMap.size() == 0 ) {
                  capabilityAccountTemplateDAO.remove(template);
                  logger.info("Capability Account Template " + template.getId() + " has been removed due to having an empty map");
                } else {
                  template.setAccounts(capabilityAccountTemplateMap);
                  capabilityAccountTemplateDAO.put(template);
                }
              }
              logger.info("All references to the deleted account " + accountId + " have been removed from capabilityAccountTemplates");
            }
          }, "On account delete, remove the reference of the account from any account templates/ any capabilityrequest using template");
        `
      }
    ]
  })
      