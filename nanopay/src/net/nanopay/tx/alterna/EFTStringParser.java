package net.nanopay.tx.alterna;

import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.util.SafetyUtil;

public class EFTStringParser implements Parser
{
  public EFTStringParser() {}

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) {
      return null;
    }

    char head;
    StringBuilder sb = builders.get();

    while ( ps.valid() ) {
      head = ps.head();
      if ( head == '|' ) {
        break;
      }
      sb.append(head);
      ps = ps.tail();
    }

    if ( ! ps.valid() && SafetyUtil.isEmpty(sb.toString()) ) {
      return null;
    }

    return ps.setValue(sb.toString());
  }

  protected ThreadLocal<StringBuilder> builders = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }
    @Override
    public StringBuilder get() {
      StringBuilder sb =  super.get();
      sb.setLength(0);
      return sb;
    }
  };
}
