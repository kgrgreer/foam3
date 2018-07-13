package net.nanopay.security;

import foam.core.FObject;
import foam.core.X;
import foam.lib.json.JSONParser;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;

public class HashedJSONParser
  extends JSONParser
{
  protected Parser parser;
  protected HashingJournal hashingJournal_;

  public HashedJSONParser(X x, HashingJournal hashingJournal) {
    setX(x);
    hashingJournal_ = hashingJournal;
    parser = new HashedFObjectParser(hashingJournal);
  }

  @Override
  public FObject parseString(String data, Class defaultClass) {
    StringPStream ps = stringps;

    ps.setString(data);
    ParserContext x = new ParserContextImpl();
    x.set("X", getX());

    ps = (StringPStream) ps.apply(defaultClass == null ?
      parser : new HashedFObjectParser(hashingJournal_, defaultClass), x);

    return ps == null ? null : (FObject) ps.value();
  }
}
