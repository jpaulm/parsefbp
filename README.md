parsefbp
========

Simple parser for .fbp notation written in JavaScript, generating JSON 

General
---

As of now, I believe this parser handles correct .fbp files correctly.  Error handling has been improved, but hopefully will be subject to further improvement as time goes on. 

Followng Wayne Stevens' original design, this parser supports a network name at the start, followed by a colon (see https://github.com/jpaulm/parsefbp/issues/4).  If this is not provided, the generated JSON will generate a network name of `MyDiagram`.

The only places end-of-lines are permitted are at the 'end of clause' - as an alternative to commas (see https://github.com/jpaulm/parsefbp/issues/3).

Definition
---

The free-form notation for defining FBP networks, an early form of which is described briefly in Chapter 23 of the 1st edition of "Flow-Based Programming" (Chap. 22 of the 2nd), basically follows a "flow" style, where connections can be chained together until a process is encountered that has no output ports connected.  This constitutes the end of a "clause", and is indicated by a comma or end-of-line.

The general syntax for free-form network definitions is quite simple, and can be shown as follows (using a variant of the notation which has started to become popular for defining syntax):  
  
![SyntaxDiagram](https://github.com/jpaulm/parsefbp/blob/master/docs/Threads.gif "Syntax Diagram")

"EOL" ("end of line") indicates the alternative NoFlo convention for "end of clause". The mark above "EOL" is meant to be a comma.

The final semi-colon may be omitted.

Other symbols:

- "Proc-name" represents a process name, optionally followed by the component name (in round brackets), optionally followed by a question mark to indicate that tracing is desired.  The component name can be specified on any occurrence of the process name. 
- "Conn" represent an arrow, with optional capacity (in round brackets), e.g. `(30)`
- "IIP" represents a quoted string (using single quotes) - any internal quotes must be escaped
- "Up-port" and "down-port" are from the point of view of the connection - they could also be called "output port" and "input port", respectively.

Note: Neither the question mark nor the capacity value are currently being used to generate JSON output.

Here is a partial example:

    'data.fil'->OPT Reader(THFILERD) OUT -> IN Selector(THSPLIT) MATCH -> ... ,
      Selector NOMATCH -> ...
      
The first occurrence of a process name in a network or subnet should specify the associated component.

Characters _not_ allowed in process names: special characters (except for underscore) or any "whitespace" characters.  However any special character can be "escaped" using a backslash (underscore does not need to be). All other characters are allowed, including numerics (except in the first position) and Chinese or other multibyte character sets.  

Port names can contain any numerics (except in the first position) and any alpha (a-z, A-Z).  Case is not significant.

Array port indexes are shown in square brackets, e.g. `OUT[2]`.
 
The NoFlo `INPORT=` and `OUTPORT=` symbols are currently ignored.

Technology
---

This parser uses the "Babel" technology which I have been using since the 1960s, and have ported to every language I've ever worked with (except maybe PL/I).  There is a description of it in https://github.com/jpaulm/babelparser/blob/master/README.md.  

`babelparser.js` contains a number of functions, such as a test for alpha (`ta`), a test for white space (`tb`), and a test for characters allowed in process names (`tv`).  In the code I have not used the term "universal comparator", but the IMO more natural `copy` and `skip`. 

The generated JSON follows the convention established for NoFlo.

Running Parser
---

This project has now been set up to run under `node.js`, so install `node.js` (http://nodejs.org), and enter `node script/test.js` in your `parsefbp` directory.  This project has a dependncy on the `babelparser` project, so you may have to do a `npm install jpaulm/babelparser --save` beforehand.  

For this test, the input data has been set up as a constant in `script/test.js`.  Output, including the first syntax error, if any, will be displayed on the console.

Alternatively, run `html\ParseFBP.html` using your favorite browser (it's been tested under Firefox).  Currently, I'm not sure how to get around the `node.js` `require` statements - but that shouldn't be too hard for those skilled in the art!

This will display a text area, and a `Generate JSON` button.  Copy the .fbp text from the `data` folder into the text area, and hit the button.

The generated JSON will be displayed as a document - it can be copy/pasted to any destination you wish. 
