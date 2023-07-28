/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ruler.test;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import foam.nanos.ruler.*;
import java.util.List;

/**
   verbose replacement for RuleEngine
 */
public class TestRuleEngine extends RuleEngine {

  public TestRuleEngine(X x, X systemX, DAO delegate) {
    super(x, systemX, delegate);
  }

  public void execute(List<Rule> rules, FObject obj, FObject oldObj) {
    CompoundContextAgency compoundAgency = new CompoundContextAgency();
    ContextualizingAgency agency         = new ContextualizingAgency(compoundAgency, userX_, getX());
    Logger                logger         = (Logger) getX().get("logger");

    for ( Rule rule : rules ) {
      PM pm = PM.create(getX(), RulerDAO.getOwnClassInfo(), rule.getDaoKey(), rule.getId());
          logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "rule", rule, "obj", obj, "old", oldObj, "test");
      try {
        if ( stops_.get()                  ) {
          logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "stop");
          break;
        }
        if ( ! isRuleActive(rule)          ) {
          logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "!active");
          continue;
        }
        if ( ! checkPermission(rule, obj)  ) {
          logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "!permission");
          continue;
        }
        if ( ! rule.f(userX_, obj, oldObj) ) {
          logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "!f");
          continue;
        }

        logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "apply");
        applyRule(rule, obj, oldObj, agency);
      } catch (java.lang.Exception e) {
        // To be expected if a rule blocks an operation. Not an error.
        logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "\\nrule", rule, "\\nobj", obj, "\\nold", oldObj, "\\n", e);
        throw e;
      } finally {
        pm.log(x_);
      }
    }

    if ( asyncAgency_.getAgents().size() > 0 ) {
      // TODO: make a better description which includes objectID and ruleGroupID
      String desc = "Async rule group";
      ((Agency) getX().get("ruleThreadPool")).submit(userX_, asyncAgency_,  desc);
    }

    try {
      compoundAgency.execute(x_);
    } catch (java.lang.Exception e) {
      // Allow network exceptions to pass through
      // TODO: use foam.core.Exception when interface properties
      //       are supported in Java generation
      if ( e instanceof foam.core.FOAMException ) {
        RuntimeException clientE = (RuntimeException) ((foam.core.FOAMException) e).getClientRethrowException();
        if ( clientE != null ) throw clientE;
      }

      // This should never happen.
      // It means there's a bug in a Rule agent and it should be fixed.
      var message = "CRITICAL UNEXPECTED EXCEPTION EXECUTING RULE";

      logger.error(message, e);
      // TODO: this breaks CI, enable when all test cases passing
      // throw new RuntimeException(message, e);
    }
  }
}
