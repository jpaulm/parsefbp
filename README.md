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

This parser uses the "Babel" technology which I have been using since the 1960s, and have ported to almost every language I've ever worked with.  This package has been published on `npm` (https://www.npmjs.org/package/babelparser), and provides a number of functions, such as a test for alpha (`ta`), a test for white space (`tb`), and a test for non-special characters (characters allowed in process names) (`tv`). There is a description of it in the BabelParser Readme file https://github.com/jpaulm/babelparser/blob/master/README.md. 

The generated JSON follows the convention established for NoFlo.

Running Parser
---

This project has a dependency on the `babelparser` project, so you should do a `npm install babelparser --save` beforehand. You should also have `node.js` (http://nodejs.org) installed.

One way of testing `parsefbp` is to run `bin/parsefbp data/DrawFBP_output.txt` on a *nix machine; on Windows, you have to say `node bin/parsefbp data/DrawFBP_output.txt`.

If you install `parsefbp` globally (by doing `npm i jpaulm/parsefbp -g`), you can then test it by typing `parsefbp test/data/DrawFBP_output.fbp`.

Note: Within your Windows Application data folder you can see what `npm` did to establish this (adds a simple wrapper) - thanks, Rob!

Another approach is to use the `html/parsefbp.js` in some html, e.g. `html/index.html`, which puts up an input textarea and an output textarea - copy or type your input text into the former, and click on the `Generate JSON` button (some .fbp files can be found in `test/data`).

Alternatively, run `npm test`.
