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

import java.util.ArrayList;
import java.util.List;

public class ComplianceHistoryDAO
  extends ReadOnlyDAO
{

  public ComplianceHistoryDAO(X x) {
    super(x);
  }

  private DAO filterDelegate() {
    ArraySink as1 = new ArraySink();
    DAO ruleDAO = (DAO) x_.get("ruleDAO");
    ruleDAO.where(OR(
      EQ(Rule.RULE_GROUP, "onboarding")
    )).select(as1);

    List<Long> ids = new ArrayList<>();
    for ( Object obj : as1.getArray() ) {
      Rule rule = (Rule) obj;
      ids.add(rule.getId());
    }

    return getDelegate().where(IN(RuleHistory.RULE_ID, ids.toArray(new Long[0])));
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
