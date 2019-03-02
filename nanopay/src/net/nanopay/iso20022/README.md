# ISO 20022

## Overview

ISO 20022 is a multi part International Standard prepared by ISO Technical Committee TC68 Financial Services. It describes a common platform for the development of messages using:
<ul>
	<li>a modelling methodology to capture in a syntax-independent way financial business areas, business transactions and associated message flows;</li>
	<li>a central dictionary of business items used in financial communications;</li>
	<li>a set of XML and ASN.1 design rules to convert the message models into XML or ASN.1 schemas, whenever the use of the ISO 20022 XML or ASN.1-based syntax is preferred.</li>
</ul>

## Model Generation

### Overview

Using FOAM we are able to model the entire ISO 20022 message repository. Through the use of scripts, we have the ability to parse XSD schema files (freely available [here](https://www.iso20022.org/full_catalogue.page)) to generate FOAM models. These models are complete with full documentation, full and short names and property level validation. This greatly reduces the pain of having to model each message by hand which would otherwise be a very tedious property.

### Dependencies

The XSD parser & model generator script use node.js and require the following packages:
<ul>
	<li>json-stringify-pretty-compact: ^1.0.4</li>
	<li>mkdir: ^0.5.1</li>
	<li>underscore: ^1.8.3</li>
	<li>xmldom : ^0.1.27</li>
</ul>

### Usage

To generate FOAM models from an XSD file by invoking the following command in the top level project directory (NANOPAY/):

```
node tools/xsd/index.js <package> <files>...
```

It will look for XSD files in the following directory. Providing a fully qualified path will not work.

```
NANOPAY/tools/xsd/messages
```

Two additional files are created as a byproduct of the script:
<ul>
	<li><b>classes.js</b>: allows for seamless integration into our Java code generation scripts.</li>
	<li><b>files.js</b>: allows us to use the model on the web client.</li>
</ul>

**Example**

```
node tools/xsd/index.js net.nanopay.iso20022 \
	pacs.002.001.09.xsd \
	pacs.008.001.06.xsd \
	pacs.028.001.01.xsd \
	pain.007.001.07.xsd \
	tsin.004.001.01.xsd

```

The above script will generate all of the models (as well as classes.js and files.js) in the following directory:
```
NANOPAY/nanopay/src/net/nanopay/iso20022
```
