// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$subexpression$1", "symbols": ["statements"]},
    {"name": "main$subexpression$1", "symbols": ["_"]},
    {"name": "main", "symbols": ["main$subexpression$1"], "postprocess": d => d[0]},
    {"name": "statements", "symbols": ["statement"], "postprocess": d => d[0]},
    {"name": "statements", "symbols": ["statements", "statement"]},
    {"name": "statement$subexpression$1", "symbols": ["sheetStmt"]},
    {"name": "statement$subexpression$1", "symbols": ["formStmt"]},
    {"name": "statement$subexpression$1", "symbols": ["staff"]},
    {"name": "statement$subexpression$1", "symbols": [(lexer.has("TEXT") ? {type: "TEXT"} : TEXT)]},
    {"name": "statement$subexpression$1", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)]},
    {"name": "statement", "symbols": ["statement$subexpression$1"], "postprocess": d => d[0]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("TEMPO") ? {type: "TEMPO"} : TEMPO)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("METER") ? {type: "METER"} : METER)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("SWING") ? {type: "SWING"} : SWING)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("SCALE") ? {type: "SCALE"} : SCALE)]},
    {"name": "sheetStmt$subexpression$1", "symbols": ["key"]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("USE") ? {type: "USE"} : USE)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("TITLE") ? {type: "TITLE"} : TITLE)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("AUTHOR") ? {type: "AUTHOR"} : AUTHOR)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("SECTION") ? {type: "SECTION"} : SECTION)]},
    {"name": "sheetStmt$subexpression$1", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "sheetStmt", "symbols": ["sheetStmt$subexpression$1"]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("TEMPO") ? {type: "TEMPO"} : TEMPO)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("METER") ? {type: "METER"} : METER)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("SWING") ? {type: "SWING"} : SWING)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("SCALE") ? {type: "SCALE"} : SCALE)]},
    {"name": "directive$subexpression$1", "symbols": ["key"]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("USE") ? {type: "USE"} : USE)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("BREAK") ? {type: "BREAK"} : BREAK)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("TEXT_NOTE") ? {type: "TEXT_NOTE"} : TEXT_NOTE)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("TEXT_NOTE2") ? {type: "TEXT_NOTE2"} : TEXT_NOTE2)]},
    {"name": "directive$subexpression$1", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "directive", "symbols": ["directive$subexpression$1"]},
    {"name": "key", "symbols": [(lexer.has("KEY") ? {type: "KEY"} : KEY), (lexer.has("CHORD_TYPE") ? {type: "CHORD_TYPE"} : CHORD_TYPE)], "postprocess":  
        d => {
            d[0].note = d[0].value
            d[0].type = d[1].value
            return d[0]
        }
            },
    {"name": "directives", "symbols": ["directive"], "postprocess": d => d[0]},
    {"name": "directives", "symbols": ["directives", "directive"]},
    {"name": "inlineStmt", "symbols": [(lexer.has("SQ_BRACKET_START") ? {type: "SQ_BRACKET_START"} : SQ_BRACKET_START), "directives", (lexer.has("SQ_BRACKET_END") ? {type: "SQ_BRACKET_END"} : SQ_BRACKET_END)]},
    {"name": "formStmt", "symbols": [(lexer.has("FORM") ? {type: "FORM"} : FORM), "listEntries"], "postprocess":  
        d => {
            // console.log( `parts: ${JSON.stringify(d[1])}`)
            d[0].parts = _.flattenDeep(d[1])
            return d[0]
        }    
            },
    {"name": "listEntries", "symbols": ["listDirective"], "postprocess": d => d[0]},
    {"name": "listEntries", "symbols": ["listEntries", "listDirective"]},
    {"name": "listDirective", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL), (lexer.has("LIST_ENTRY") ? {type: "LIST_ENTRY"} : LIST_ENTRY)], "postprocess": d => d[1]},
    {"name": "staff$subexpression$1", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)]},
    {"name": "staff$subexpression$1", "symbols": [(lexer.has("SECTION") ? {type: "SECTION"} : SECTION)]},
    {"name": "staff", "symbols": ["staff$subexpression$1", "bar", "barDirectives"]},
    {"name": "barDirectives", "symbols": ["barDirective"], "postprocess": d => d[0]},
    {"name": "barDirectives", "symbols": ["barDirectives", "barDirective"]},
    {"name": "barDirective$subexpression$1", "symbols": ["chord"]},
    {"name": "barDirective$subexpression$1", "symbols": ["duration"]},
    {"name": "barDirective$subexpression$1", "symbols": ["note"]},
    {"name": "barDirective$subexpression$1", "symbols": ["bar"]},
    {"name": "barDirective$subexpression$1", "symbols": [(lexer.has("REST") ? {type: "REST"} : REST)]},
    {"name": "barDirective$subexpression$1", "symbols": [(lexer.has("REPEAT_PREV") ? {type: "REPEAT_PREV"} : REPEAT_PREV)]},
    {"name": "barDirective$subexpression$1", "symbols": [(lexer.has("GROOVE_ADJUST") ? {type: "GROOVE_ADJUST"} : GROOVE_ADJUST)]},
    {"name": "barDirective$subexpression$1", "symbols": ["inlineStmt"]},
    {"name": "barDirective", "symbols": ["barDirective$subexpression$1"]},
    {"name": "bar$subexpression$1", "symbols": [(lexer.has("REPEAT_END_COUNT") ? {type: "REPEAT_END_COUNT"} : REPEAT_END_COUNT)]},
    {"name": "bar$subexpression$1", "symbols": []},
    {"name": "bar$subexpression$2", "symbols": [(lexer.has("REPEAT_COUNT") ? {type: "REPEAT_COUNT"} : REPEAT_COUNT)]},
    {"name": "bar$subexpression$2", "symbols": []},
    {"name": "bar", "symbols": ["bar$subexpression$1", (lexer.has("BAR") ? {type: "BAR"} : BAR), "bar$subexpression$2"], "postprocess": 
        d => { 
            d[1]['repeat'] = d[2]
            d[1]['repEnd'] = d[0]
            return  d[1]
        }
            },
    {"name": "note$subexpression$1", "symbols": [(lexer.has("NOTE") ? {type: "NOTE"} : NOTE)]},
    {"name": "note", "symbols": ["note$subexpression$1"], "postprocess":  
        d => { 
            return {
                token: 'NOTE',
                note:  d[0],
                }
            }
            },
    {"name": "chord$subexpression$1", "symbols": [(lexer.has("CHORD_NOTE") ? {type: "CHORD_NOTE"} : CHORD_NOTE)]},
    {"name": "chord$subexpression$2", "symbols": [(lexer.has("CHORD_TYPE") ? {type: "CHORD_TYPE"} : CHORD_TYPE)]},
    {"name": "chord$subexpression$2", "symbols": []},
    {"name": "chord$subexpression$3", "symbols": ["chordExt"]},
    {"name": "chord$subexpression$3", "symbols": []},
    {"name": "chord$subexpression$4", "symbols": ["chordExt2"]},
    {"name": "chord$subexpression$4", "symbols": []},
    {"name": "chord$subexpression$5", "symbols": ["chordMinusNote"]},
    {"name": "chord$subexpression$5", "symbols": []},
    {"name": "chord$subexpression$6", "symbols": [(lexer.has("CHORD_INVERSION") ? {type: "CHORD_INVERSION"} : CHORD_INVERSION)]},
    {"name": "chord$subexpression$6", "symbols": []},
    {"name": "chord$subexpression$7", "symbols": [(lexer.has("CHORD_BASS") ? {type: "CHORD_BASS"} : CHORD_BASS)]},
    {"name": "chord$subexpression$7", "symbols": []},
    {"name": "chord", "symbols": ["chord$subexpression$1", "chord$subexpression$2", "chord$subexpression$3", "chord$subexpression$4", "chord$subexpression$5", "chord$subexpression$6", "chord$subexpression$7"], "postprocess":  
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
            },
    {"name": "chordExt", "symbols": [(lexer.has("CHORD_EXT") ? {type: "CHORD_EXT"} : CHORD_EXT)], "postprocess":  
        d => { 
               return {
                   token: 'EXT',
                   ext:  d[0],
                   }
               }
           },
    {"name": "chordExt$subexpression$1", "symbols": ["chordExt"]},
    {"name": "chordExt$subexpression$2", "symbols": [(lexer.has("CHORD_EXT") ? {type: "CHORD_EXT"} : CHORD_EXT)]},
    {"name": "chordExt", "symbols": ["chordExt$subexpression$1", "chordExt$subexpression$2"], "postprocess":  
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
        },
    {"name": "chordExt2", "symbols": [(lexer.has("CHORD_EXT2") ? {type: "CHORD_EXT2"} : CHORD_EXT2)], "postprocess":  
        d => { 
               return {
                   token: 'EXT2',
                   ext2:  d[0],
                   }
               }
           },
    {"name": "chordExt2$subexpression$1", "symbols": ["chordExt2"]},
    {"name": "chordExt2$subexpression$2", "symbols": [(lexer.has("CHORD_EXT2") ? {type: "CHORD_EXT2"} : CHORD_EXT2)]},
    {"name": "chordExt2", "symbols": ["chordExt2$subexpression$1", "chordExt2$subexpression$2"], "postprocess":  
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
        },
    {"name": "chordMinusNote", "symbols": [(lexer.has("CHORD_MINUS_NOTE") ? {type: "CHORD_MINUS_NOTE"} : CHORD_MINUS_NOTE)], "postprocess":  
        d => { 
               return {
                   token: 'MINUS',
                   minus:  d[0],
                   }
               }
           },
    {"name": "chordMinusNote$subexpression$1", "symbols": ["chordMinusNote"]},
    {"name": "chordMinusNote$subexpression$2", "symbols": [(lexer.has("CHORD_MINUS_NOTE") ? {type: "CHORD_MINUS_NOTE"} : CHORD_MINUS_NOTE)]},
    {"name": "chordMinusNote", "symbols": ["chordMinusNote$subexpression$1", "chordMinusNote$subexpression$2"], "postprocess":  
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
        },
    {"name": "durationAdd$subexpression$1", "symbols": [(lexer.has("DURATION_ADD") ? {type: "DURATION_ADD"} : DURATION_ADD)]},
    {"name": "durationAdd", "symbols": ["durationAdd$subexpression$1"], "postprocess":  
        d =>  d[0]
            },
    {"name": "durationAdd$subexpression$2", "symbols": ["durationAdd"]},
    {"name": "durationAdd$subexpression$3", "symbols": [(lexer.has("DURATION_ADD") ? {type: "DURATION_ADD"} : DURATION_ADD)]},
    {"name": "durationAdd", "symbols": ["durationAdd$subexpression$2", "durationAdd$subexpression$3"], "postprocess": 
        d => { 
            addList = []
            d.forEach( (value) => {
                addList.push(value[0])
            })
            return addList
        }
            },
    {"name": "duration$subexpression$1", "symbols": [(lexer.has("DURATION") ? {type: "DURATION"} : DURATION)]},
    {"name": "duration$subexpression$2", "symbols": ["durationAdd"]},
    {"name": "duration$subexpression$2", "symbols": []},
    {"name": "duration", "symbols": ["duration$subexpression$1", "duration$subexpression$2"], "postprocess":  
        d => { 
            d[0][0]['add'] = d[1][0]
            return d[0]
        }
            },
    {"name": "_", "symbols": [(lexer.has("NL") ? {type: "NL"} : NL)], "postprocess": () => null}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
