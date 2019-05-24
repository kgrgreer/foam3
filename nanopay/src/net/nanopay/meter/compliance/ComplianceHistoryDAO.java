package net.nanopay.meter.compliance;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ReadOnlyDAO;
import static foam.mlang.MLang.*;

import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.nanos.ruler.Rule;
import foam.nanos.ruler.RuleHistory;

public class ComplianceHistoryDAO
  extends ReadOnlyDAO
{

  public ComplianceHistoryDAO(X x) {
    super(x);
  }

  private DAO filterDelegate() {
    return getDelegate().where(IN(
      RuleHistory.RULE_ID,
      ((ArraySink) ((DAO) x_.get("ruleDAO")).where(OR(
          EQ(Rule.RULE_GROUP, "onboarding"))
      ).select(new ArraySink())).getArray().stream().map((rule) -> ((Rule)rule).getId()).toArray()
    ));
  }

  @Override
  public DAO where(Predicate predicate) {
    return filterDelegate().where(predicate);
  }

  @Override
  public Sink select(Sink sink) {
    return filterDelegate().select(sink);
  }

  @Override
  public FObject find(Object id) {
    return filterDelegate().find(id);
  }
}
