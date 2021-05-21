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
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.F3FileJournal',

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.lib.StoragePropertyPredicate',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.io.BufferedReader',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.HashMap',
    'java.util.Map',
  ],

  properties: [
    {
      name: 'messageDigest',
      class: 'FObjectProperty',
      of: 'net.nanopay.security.MessageDigest',
      javaFactory: 'return new MessageDigest();'
    },
    {
      class: 'Boolean',
      name: 'digestRequired',
      value: true,
      documentation: 'Flag to determine if digest is required when parsing'
    },
    {
      name: 'quoteKeys',
      class: 'Boolean'
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new StdoutLogger();
        }
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected static ThreadLocal<JSONFObjectFormatter> formatter = new ThreadLocal<JSONFObjectFormatter>() {
            @Override
            protected JSONFObjectFormatter initialValue() {
              return new HashingOutputter();
            }
            @Override
            public JSONFObjectFormatter get() {
              JSONFObjectFormatter b = super.get();
              b.reset();
              b.setPropertyPredicate(new StoragePropertyPredicate());
              b.setOutputShortNames(true);
              return b;
            }
          };

          protected JSONFObjectFormatter getFormatter(X x) {
            JSONFObjectFormatter f = formatter.get();
            f.setX(x);
            f.setQuoteKeys(getQuoteKeys());
            ((HashingOutputter) f).setMessageDigest(getMessageDigest());
            return f;
          }

          protected static ThreadLocal<foam.lib.json.JSONParser> jsonParser = new ThreadLocal<foam.lib.json.JSONParser>() {
            @Override
            protected foam.lib.json.JSONParser initialValue() {
              return new HashedJSONParser();
            }
            @Override
            public JSONParser get() {
              JSONParser parser = super.get();
              return parser;
            }
          };

          protected foam.lib.json.JSONParser getParser(X x) {
            foam.lib.json.JSONParser p = jsonParser.get();
            p.setX(x);
            ((HashedJSONParser) p).setMessageDigest(getMessageDigest());
            ((HashedJSONParser) p).setDigestRequired(getDigestRequired());
            return p;
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'reset',
      javaCode: 'getMessageDigest().reset();'
    },
    {
      documentation: 'Replays the journal file, expected to be single threaded, does not use assembly as entries are ordered.',
      name: 'replay',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'dao', type: 'foam.dao.DAO' }
      ],
      javaCode: `
        JSONParser parser = (JSONParser) getParser(x);

        // count number of entries successfully read
        AtomicInteger successReading = new AtomicInteger();

        // NOTE: explicitly calling PM constructor as create only creates
        // a percentage of PMs, but we want all replay statistics
        PM pm = new PM(this.getClass().getSimpleName(), dao.getOf().getId(), "replay", getFilename());

        try ( BufferedReader reader = getReader() ) {
          if ( reader == null ) {
            return;
          }
          Class defaultClass = dao.getOf().getObjClass();
          for (  CharSequence entry ; ( entry = getEntry(reader) ) != null ; ) {
            int length = entry.length();
            if ( length == 0 ) continue;
            if ( COMMENT.matcher(entry).matches() ) continue;
            try {
              final char operation = entry.charAt(0);
              final String strEntry = entry.subSequence(2, length - 1).toString();
              FObject obj = parser.parseString(strEntry, defaultClass);
              if ( obj == null ) {
                getLogger().error("Parse error", getParsingErrorMessage(strEntry), "entry:", strEntry);
                return;
              }
              switch ( operation ) {
                case 'p':
                  foam.core.FObject old = dao.find(obj.getProperty("id"));
                  dao.put(old != null ? mergeFObject(old.fclone(), obj) : obj);
                  break;

                case 'r':
                  dao.remove(obj);
                  break;
              }
              successReading.incrementAndGet();
            } catch ( Throwable t ) {
              getLogger().error("Error replaying journal entry:", entry, t);
              throw t;
            }
          }
        } catch ( Throwable t) {
          pm.error(x, t);
          getLogger().error("Failed to read from journal", t);
          throw new RuntimeException(t);
        } finally {
          pm.log(x);
          getLogger().info("Successfully read " + successReading.get() + " entries from file: " + getFilename() + " in: " + pm.getTime() + "(ms)");
        }
      `
    }
  ]
});
