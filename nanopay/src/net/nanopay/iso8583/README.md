# ISO 8583

## Overview

ISO 8583 is an international standard for financial transaction card originated interchange messaging. It is the International Organization for Standardization standard for systems that exchange electronic transactions initiated by cardholders using payment cards. ISO 8583 defines a message format and a communication flow so that different systems can exchange these transaction requests and responses.

## Message Format

An ISO 8583 message is made of the following parts:
<ul>
	<li>Message type indicator (MTI)</li>
	<li>One or more bitmaps, indicating which data elements are present</li>
	<li>Data elements, the actual information fields of the message</li>
</ul>

### Message Type Indicator

The Message Type Indicator is a four digit numeric field that represents the following: the ISO 8583 version, the message class, the message function, and the message origin.

#### ISO 8583 Version

This field defines the version of the ISO 8583 message.

| Code 	| Meaning              	|
|------	|----------------------	|
| 0xxx 	| ISO 8583:1987        	|
| 1xxx 	| ISO 8583:1993        	|
| 2xxx 	| ISO 8583:2003        	|
| 3xxx 	| Reserved for ISO use 	|
| 4xxx 	| Reserved for ISO use 	|
| 5xxx 	| Reserved for ISO use 	|
| 6xxx 	| Reserved for ISO use 	|
| 7xxx 	| Reserved for ISO use 	|
| 8xxx 	| National Use         	|
| 9xxx 	| Private Use          	|

#### Message Class

This field defines the overall purpose of the message.

| Code 	| Meaning                          	| Usage                                                                                                                                                                        	|
|------	|----------------------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| x0xx 	| Reserved for ISO use             	|                                                                                                                                                                              	|
| x1xx 	| Authorization messages           	| Determine if funds are available, get an approval but do not post to account for reconciliation. Dual message system (DMS), awaits file exchange for posting to the account. 	|
| x2xx 	| Financial messages               	| Determine if funds are available, get an approval and post directly to the account. Single message system (SMS), no file exchange after this.                                	|
| x3xx 	| File actions messages            	| Used for hot-card, TMS and other exchanges                                                                                                                                   	|
| x4xx 	| Reversal and chargeback messages 	| Reversal (x4x0 or x4x1): Reverses the action of a previous authorization. Chargeback (x4x2 or x4x3): Charges back a previously cleared financial message.                    	|
| x5xx 	| Reconciliation messages          	| Transmits settlement information message.                                                                                                                                    	|
| x6xx 	| Administrative messages          	| Transmits administrative advice. Often used for failure messages (e.g. message reject or failure to apply).                                                                  	|
| x7xx 	| Fee collection messages          	|                                                                                                                                                                              	|
| x8xx 	| Network management messages      	| Used for secure key exchange, logon, echo test and other network functions.                                                                                                  	|
| x9xx 	| Reserved for ISO use             	|                                                                                                                                                                              	|

#### Message Function

This field defines how the message should flow within the system.

| Code 	| Meaning                      	| Notes                                                                      	|
|------	|------------------------------	|----------------------------------------------------------------------------	|
| xx0x 	| Request                      	|                                                                            	|
| xx1x 	| Request response             	|                                                                            	|
| xx2x 	| Advice                       	|                                                                            	|
| xx3x 	| Advice response              	|                                                                            	|
| xx4x 	| Notification                 	|                                                                            	|
| xx5x 	| Notification acknowledgement 	|                                                                            	|
| xx6x 	| Instruction                  	| ISO 8583:2003 only                                                         	|
| xx7x 	| Instruction acknowledgement  	| ISO 8583:2003 only                                                         	|
| xx8x 	| Reserved for ISO use         	| Some implementations (such as MasterCard) use for positive acknowledgment. 	|
| xx9x 	| Reserved for ISO use         	| Some implementations (such as MasterCard) use for negative acknowledgment. 	|

#### Message Origin

This field defines the location of the message source within the payment chain.

| Code 	| Meaning              	|
|------	|----------------------	|
| xxx0 	| Acquirer             	|
| xxx1 	| Acquirer repeat      	|
| xxx2 	| Issuer               	|
| xxx3 	| Issuer repeat        	|
| xxx4 	| Other                	|
| xxx5 	| Other repeat         	|
| xxx6 	| Reserved for ISO use 	|
| xxx7 	| Reserved for ISO use 	|
| xxx8 	| Reserved for ISO use 	|
| xxx9 	| Reserved for ISO use 	|

### Bitmap

In ISO 8583, a bitmap is a field or subfield within a message, which indicates whether other data elements or data element subfields are present elsewhere in the message.

### Data Elements

Data elements are the individual fields carrying the transaction information. There are up to 128 data elements specified in the original ISO 8583:1987 standard, and up to 192 data elements in later releases. The 1993 revision added new definitions, deleted some, while leaving the message format itself unchanged.

While each data element has a specified meaning and format, the standard also includes some general purpose data elements and system- or country-specific data elements which vary enormously in use and form from implementation to implementation.

## Implementation

### ISOMessage

The ISOMessage class is used construct an ISO 8583 message. Using this class one is able to set data elements for their message and then pack them into the ISO 8583 message format. To package each data element a packager class must be specified. ISO 8583 is a very generic message format and does not provide much information in the way of how a specific field must be packaged. To get around this we use a packager interface which determines how to pack specific fields.

#### Usage

To set string data elements on an ISOMessage:

```
// create an ISO 8583:1987 message
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.iso8583.ISOMessage message = new net.nanopay.iso8583.ISOMessage.Builder(x)
	.setPackager(new net.nanopay.iso8583.ISO87Packager())
	.build();

// set MTI and primary account number
message.set(0, "0100");
message.set(2, "1234567890123456789");
```

To set binary data elements on an ISOMessage:

```
// create an ISO 8583:1987 message
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.iso8583.ISOMessage message = new net.nanopay.iso8583.ISOMessage.Builder(x)
	.setPackager(new net.nanopay.iso8583.ISO87Packager())
	.build();

// set message security code
message.set(96, new byte[] { 0x01, 0x02, 0x03, 0x04 });
```

To pack an ISOMessage:

```
// create an ISO 8583:1987 message
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.iso8583.ISOMessage message = new net.nanopay.iso8583.ISOMessage.Builder(x)
	.setPackager(new net.nanopay.iso8583.ISO87Packager())
	.build();

// set MTI and primary account number
message.set(0, "0100");
message.set(2, "1234567890123456789");

// pack into a ByteArrayOutputStream
java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
message.pack(baos);

// print out bytes
System.out.println(java.util.Arrays.toString(baos.toByteArray()));

```

To unpack an ISOMessage:

```
// create an ISO 8583:1987 message
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.iso8583.ISOMessage message = new net.nanopay.iso8583.ISOMessage.Builder(x)
	.setPackager(new net.nanopay.iso8583.ISO87Packager())
	.build();

java.io.ByteArrayInputStream bais = ... // load a ISO 8583 from some source (file, network call)
message.unpack(bais);

// print out unpacked message
System.out.println(new foam.lib.json.Outputter(foam.lib.json.OutputterMode.STORAGE).stringify(message););
```

### Packagers

Every ISOMessage class must have a packager so that it will be able to pack/unpack each data element. The following packages are available for use:
<ul>
	<li><b>ISO87Packager</b>: a packager with data elements corresponding to the 1987 version of the ISO 8583 standard.</li>
	<li><b>ISO93Packager</b>: a packager with data elements corresponding to the 1993 version of the ISO 8583 standard.</li>
</ul>
