foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'TimeBasedReceiptGenerationPolicy',
  extends: 'net.nanopay.security.receipt.AbstractReceiptGenerationPolicy',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected java.util.concurrent.ScheduledFuture scheduled_ = null;
          protected java.util.concurrent.ScheduledExecutorService executor_ =
              java.util.concurrent.Executors.newScheduledThreadPool(16);
        `)
      }
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'interval',
      value: 20
    }
  ],

  methods: [
    {
      name: 'schedule',
      javaReturns: 'boolean',
      javaCode: `
        if (interval_ <= 0) {
          return false;
        }

        if ( scheduled_ != null ) {
          // cancel previous scheduled generation
          scheduled_.cancel(false);
        }

        scheduled_ = executor_.scheduleAtFixedRate(new Runnable() {
          @Override
          public void run() {
            getListener().onGenerateReceipt();
          }
        }, interval_, interval_, java.util.concurrent.TimeUnit.MILLISECONDS);
        return true;
      `
    },
    {
      name: 'start',
      javaCode: 'schedule();'
    }
  ]
});
