@{%
const _ = require('lodash')
const lexer = require("./lexer.js");

const ignore = [ "WS" ]  

lexer.next = (next => () => {   
  let token;
  while ((token = next.call(lexer)) && (
    ignore.includes(token.type)
  )) {}

  return token;
})(lexer.next);

const cnt = 0

%}

# Pass your lexer object using the @lexer option:
@lexer lexer

main -> ( statements |  _ )  {% d => d[0] %}

statements -> statement {% d => d[0] %}
    |  statements statement

statement  -> ( sheetStmt | formStmt | staff | %TEXT | %NL ) {% d => d[0] %} 

sheetStmt -> ( %TEMPO | %METER | %SWING | %SCALE | key | %USE | %TITLE | %AUTHOR | %SECTION | %COMMA ) 

directive -> (  %TEMPO  | %METER | %SWING | %SCALE | key | %USE | %BREAK | %TEXT_NOTE |%TEXT_NOTE2 | %COMMA )

key -> %KEY %CHORD_TYPE {% 
        d => {
            d[0].note = d[0].value
            d[0].type = d[1].value
            return d[0]
        }
    %} 

directives -> directive {% d => d[0] %}
    | directives directive

inlineStmt -> %SQ_BRACKET_START directives %SQ_BRACKET_END

formStmt -> %FORM listEntries {% 
        d => {
            // console.log( `parts: ${JSON.stringify(d[1])}`)
            d[0].parts = _.flattenDeep(d[1])
            return d[0]
        }    
    %}

listEntries -> listDirective {% d => d[0] %}
    | listEntries listDirective

listDirective -> %NL %LIST_ENTRY {% d => d[1] %}

staff -> ( %NL | %SECTION )  bar barDirectives 

barDirectives -> barDirective {% d => d[0] %}
    | barDirectives barDirective

barDirective -> ( chord | duration | note | bar | %REST | %REPEAT_PREV | %GROOVE_ADJUST | inlineStmt )

bar -> (%REPEAT_END_COUNT | null) %BAR ( %REPEAT_COUNT | null ) {%
        d => { 
            d[1]['repeat'] = d[2]
            d[1]['repEnd'] = d[0]
            return  d[1]
        }
    %}

note ->  ( %NOTE ) {% 
        d => { 
            return {
                token: 'NOTE',
                note:  d[0],
                }
            }
    %}
    
chord -> ( %CHORD_NOTE ) ( %CHORD_TYPE | null ) ( chordExt | null ) ( chordExt2 | null ) 
         ( chordMinusNote | null ) ( %CHORD_INVERSION | null ) ( %CHORD_BASS | null ) {% 
        d => { 
            return {
                type: 'CHORD',
                note:   d[0],
                majMin: d[1],
                ext:    d[2],
                ext2:   d[3],
                minus:  d[4],
                inv:    d[5],
                bass:   d[6]
            }
        }
    %}

chordExt -> %CHORD_EXT {% 
     d => { 
            return {
                token: 'EXT',
                ext:  d[0],
                }
            }
        %}
    | ( chordExt ) ( %CHORD_EXT )  {% 
        d => { 
            extList = []
            d.forEach( (value) => {
                extList.push(value[0])
            })
            return {
                type: 'EXT',
                ext:  extList,
                }
            }
        %}

chordExt2 -> %CHORD_EXT2 {% 
     d => { 
            return {
                token: 'EXT2',
                ext2:  d[0],
                }
            }
        %}
    | ( chordExt2 ) ( %CHORD_EXT2 )  {% 
        d => { 
            ext2List = []
            d.forEach( (value) => {
                ext2List.push(value[0])
            })
            return {
                token: 'EXT2',
                ext2:  ext2List,
                }
            }
        %}

chordMinusNote -> %CHORD_MINUS_NOTE {% 
     d => { 
            return {
                token: 'MINUS',
                minus:  d[0],
                }
            }
        %}
    | ( chordMinusNote) (%CHORD_MINUS_NOTE)  {% 
        d => { 
            minusList = []
            d.forEach( (value) => {
                minusList.push(value[0])
            })
            return {
                token: 'MINUS',
                minus:  minusList,
                }
            }
        %}

durationAdd -> ( %DURATION_ADD ) {% 
        d =>  d[0]
    %}
    | (durationAdd) (%DURATION_ADD) {%
        d => { 
            addList = []
            d.forEach( (value) => {
                addList.push(value[0])
            })
            return addList
        }
    %}

duration -> ( %DURATION ) ( durationAdd | null ) {% 
        d => { 
            d[0][0]['add'] = d[1][0]
            return d[0]
        }
    %}

_ -> %NL  {% () => null %}
