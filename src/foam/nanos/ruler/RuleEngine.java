/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.ruler;

import foam.core.*;
import foam.dao.DAO;
import foam.nanos.auth.*;
import foam.nanos.dao.Operation;
import foam.nanos.logger.Logger;
import foam.nanos.pm.PM;
import java.lang.Exception;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;


public class RuleEngine extends ContextAwareSupport {
  private DAO                      delegate_         = null;
  private DAO                      ruleHistoryDAO_   = null;
  private AtomicBoolean            stops_            = new AtomicBoolean(false);
  private Map<String, Object>      results_          = new HashMap<>();
  private Map<String, RuleHistory> savedRuleHistory_ = new HashMap<>();
  private X                        userX_;

  public RuleEngine(X x, X systemX, DAO delegate) {
    setX(systemX);
    setDelegate(delegate);
    ruleHistoryDAO_ = (DAO) x.get("ruleHistoryDAO");
    userX_ = x;
  }

  public DAO getDelegate() {
    return delegate_;
  }

  public void setDelegate(DAO delegate) {
    this.delegate_ = delegate;
  }

  /**
   * Executes rules by applying their actions. Async rules will be submitted to
   * 'asyncExecutor_' which will execute all rule actions sequentially in a new
   * thread.
   *
   * Each rule would check object applicability before applying action.
   *
   * Before generating any logger.debug(...) calls rule.debug property should be tested:
   *  if ( rule.getDebug() ) { logger.debug(…) };
   *
   * @param rules - Rules to be considered applying
   * @param obj - FObject supplied to rules for execution
   * @param oldObj - Old FObject supplied to rules for execution
   */

  public void execute(List<Rule> rules, FObject obj, FObject oldObj) {
    CompoundContextAgency compoundAgency = new CompoundContextAgency();
    ContextualizingAgency agency         = new ContextualizingAgency(compoundAgency, userX_, getX());
    Logger                logger         = (Logger) getX().get("logger");

    for ( Rule rule : rules ) {
      PM pm = PM.create(getX(), RulerDAO.getOwnClassInfo(), rule.getDaoKey(), rule.getId());
      try {
        if ( stops_.get()                  ) break;
        if ( ! isRuleActive(rule)          ) continue;
        if ( ! checkPermission(rule, obj)  ) continue;
        if ( ! rule.f(userX_, obj, oldObj) ) continue;

        applyRule(rule, obj, oldObj, agency);
      } catch (Exception e) {
        // To be expected if a rule blocks an operation. Not an error.
        logger.debug(this.getClass().getSimpleName(), "id", rule.getId(), "\\nrule", rule, "\\nobj", obj, "\\nold", oldObj, "\\n", e);
        throw e;
      } finally {
        pm.log(x_);
      }
    }

    try {
      compoundAgency.execute(x_);
    } catch (Exception e) {
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

  /**
   * Probes rules execution by applying actions and skipping
   * execution of agents that contain code that effects the system
   *
   * @param rules - Rules to be considered applying
   * @param obj - FObject supplied to rules for execution
   * @param rulerProbe -
   * @param oldObj - Old FObject supplied to rules for execution
   */
  public void probe(List<Rule> rules, RulerProbe rulerProbe, FObject obj, FObject oldObj) {
    PM pm = PM.create(getX(), RulerProbe.getOwnClassInfo(), "Probe:" + obj.getClassInfo());

    try {
      for ( Rule rule : rules ) {
        if ( ! isRuleActive(rule)                   ) continue;
        if ( ! checkPermission(rule, obj)           ) continue;
        if ( ! rule.f(userX_, obj, oldObj)          ) continue;

        TestedRule agent = new TestedRule();
        agent.setRule(rule.getId());
        if ( stops_.get() ) {
          agent.setMessage("Not executed because was overridden and forced to stop.");
          agent.setPassed(false);
          rulerProbe.getAppliedRules().add(agent);
          continue;
        }

        if ( rule.getAsync() ) {
          agent.setMessage("Async rule, action not executed.");
          rulerProbe.getAppliedRules().add(agent);
          continue;
        }

        try {
          applyRule(rule, obj, oldObj, agent);
          agent.setMessage("Successfully applied");
        } catch (Exception e ) {
          agent.setPassed(false);
          agent.setMessage(e.getMessage());
        }

        rulerProbe.getAppliedRules().add(agent);
      }
    } finally {
      pm.log(x_);
    }
  }

  /**
   * Stops the execution of rules.
   */
  public void stop() {
    stops_.set(true);
  }

  /**
   * Store result of a rule execution
   * @param result
   */
  public void putResult(String ruleId, Object result) {
    results_.put(ruleId, result);
  }

  public Object getResult(String ruleId) {
    return results_.get(ruleId);
  }

  private void applyRule(Rule rule, FObject obj, FObject oldObj, Agency agency) {
    if ( rule.getAsync() ) {
      applyAsyncRule(rule, obj, oldObj);
    } else {
      ProxyX readOnlyX = new ReadOnlyDAOContext(userX_);
      rule.apply(readOnlyX, obj, oldObj, this, rule, agency);
    }
  }

  private void applyAsyncRule(Rule rule, FObject obj, FObject oldObj) {
    ((Agency) getX().get("ruleThreadPool")).submit(userX_, new ContextAgent() {
        @Override
        public void execute(X x) {
          if ( stops_.get() ) return;

          // Reload the "obj" as it might be stale by the time the async rule is
          // executed. Re-run the rule predicate on the reloaded object to ensure
          // the eligibility to execute the rule action.
          //
          // NOTE: There is no need to reload the "rule" object and re-check
          // isActive and permission as it was the rule at the time RuleEngine.execute()
          // is called that the rule engine honors and should commit to, not the
          // future version of the same rule.
          var nu = rule.getOperation() != Operation.REMOVE ? reloadObject(obj) : obj;
          if ( ! rule.f(x, nu, oldObj) ) return;

          PM pm = PM.create(getX(), RulerDAO.getOwnClassInfo(), "ASYNC", rule.getDaoKey(), rule.getId());
          var before = rule.getOperation() != Operation.REMOVE ? nu.fclone() : obj;
          rule.asyncApply(x, nu, oldObj, RuleEngine.this, rule);
          if ( rule.getOperation() != Operation.REMOVE && ! before.equals(nu) ) {
            getDelegate().put_(userX_, nu);
          }
          pm.log(getX());
        }
      }, "Async apply rule id: " + rule.getId());
  }

  /**
   * Check if the rule is in an ACTIVE state:
   * 1) the rule is enabled
   * 2) the rule lifecycle state is active
   * 3) the rule has an action.
   *
   * @param rule    rule object to check
   * @return true if the rule is ACTIVE, false otherwise
   */
  private boolean isRuleActive(Rule rule) {
    return rule.getEnabled() &&
           rule.getLifecycleState() == LifecycleState.ACTIVE &&
           rule.getAction() != null;
  }

  private boolean checkPermission(Rule rule, FObject obj) {
    var user = rule.getUser(getX(), obj);

    if ( user != null ) {
      var auth = (AuthService) getX().get("auth");
      return auth.checkUser(getX(), user, "rule.read." + rule.getId());
    }

    return true;
  }

  private FObject reloadObject(FObject obj) {
    var reloaded = getDelegate().find_(userX_, obj);
    if ( reloaded == null ) {
      return obj;
    }
    return reloaded.fclone();
  }

  /**
   * Save rule execution history to DAO.
   *
   * @param rule Reference to the executed rule
   * @param obj Reference to the object for the rule execution
   */
  public void saveHistory(Rule rule, FObject obj) {
    if ( ! rule.getSaveHistory() ) return;

    RuleHistory record = savedRuleHistory_.get(rule.getId());
    if ( record == null ) {
      record = new RuleHistory.Builder(getX())
        .setRuleId(rule.getId())
        .setObjectId(obj.getProperty("id"))
        .setObjectDaoKey(rule.getDaoKey())
        .build();
    }

    record.setResult(getResult(rule.getId()));

    if ( rule.getValidity() > 0 ) {
      Duration validity = Duration.ofDays(rule.getValidity());
      Date expirationDate = Date.from(Instant.now().plus(validity));
      record.setExpirationDate(expirationDate);
      record.setStatus(RuleHistoryStatus.SCHEDULED);
    }

    savedRuleHistory_.put(rule.getId(),
      (RuleHistory) ruleHistoryDAO_.put(record).fclone());
  }
}
