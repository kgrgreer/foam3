Notes on interac
Cash In from interac to nanopay trust account, is initiated by a pacs008 message. A transaction is created in PENDING state with TrxProcessorId INTERAC.
An InteracCompletionAgent will run via cron and mark the transaction COMPLETE after 30 minutes, or if an etransfer message is recieved, the transaction is also marked COMPLETE and the money credited to the outbount digital cash account.
