/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "support",
  version: 3,
  files: [
    { name: "modal/NewEmailSupportModal",                                                 flags: "web" },
    { name: "modal/NewEmailSupportConfirmationModal",                                    flags: "web" },
    { name: "modal/DeleteEmailSupportModal",                                              flags: "web" },
    { name: "model/SupportEmail",                                                         flags: "js|java" },
    { name: "model/TicketMessage",                                                        flags: "js|java", },
    { name: "model/Ticket",                                                               flags: "js|java" },
    { name: "view/CreateTicketView",                                                      flags: "web" },
    { name: "view/MessageCard",                                                           flags: "web" },
    { name: "view/ReplyView",                                                             flags: "web" },
    { name: "view/SupportEmailView",                                                      flags: "web" },
    { name: "view/SummaryCard",                                                           flags: "web" },
    { name: "view/TicketView",                                                            flags: "web" },
    { name: "view/TicketDetailView",                                                      flags: "web" },
    { name: "view/TicketSummaryView",                                                     flags: "web" }
]});
