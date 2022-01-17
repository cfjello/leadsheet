
import XRegExp from './node_modules/xregexp/xregexp-all.js'
/*
// Using named capture and flag x (free-spacing and line comments)
const date0 = XRegExp(`(?<year>  [0-9]{4} ) -?  # year
                      (?<month> [0-9]{2} ) -?  # month
                      (?<day>   [0-9]{2} )     # day`, 'x');

let m = date0.exec('2004-12-11')

console.log(m)

// Using named backreferences...
XRegExp.exec('2021-02-23', date0).groups.year;
// -> '2021'
let m1 = XRegExp.replace('2021-02-23', date0, '$<month>/$<day>/$<year>');
// -> '02/23/2021'

console.log(m1)


// Finding matches within matches, while passing forward and returning specific backreferences
const html0 = '<a href="http://xregexp.com/api/">XRegExp</a>' +
             '<a href="http://www.google.com/">Google</a>';

let m2 = XRegExp.matchChain(html0, [
  {regex: /<a href="([^"]+)">/i, backref: 1},
  {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]);
// -> ['xregexp.com', 'www.google.com']

console.log(m2)

// Using named capture and flag x for free-spacing and line comments
const date = XRegExp(
    `(?<year>  [0-9]{4} ) -?  # year
     (?<month> [0-9]{2} ) -?  # month
     (?<day>   [0-9]{2} )     # day`, 'x');

// XRegExp.exec provides named backreferences on the result's groups property
let match = XRegExp.exec('2021-02-22', date);
match.groups.year; // -> '2021'

// It also includes optional pos and sticky arguments
let pos = 3;
const result = [];
while (match = XRegExp.exec('<1><2><3>4<5>', /<(\d+)>/, pos, 'sticky')) {
    result.push(match[1]);
    pos = match.index + match[0].length;
}
console.log(result)
// result -> ['2', '3']

// XRegExp.replace allows named backreferences in replacements
XRegExp.replace('2021-02-22', date, '$<month>/$<day>/$<year>');
// -> '02/22/2021'
let m3 = XRegExp.replace('2021-02-22', date, (...args) => {
    // Named backreferences are on the last argument
    const groups = args[args.length - 1];
    return `${groups.month}/${groups.day}/${groups.year}`;
});
console.log(m3)
// -> '02/22/2021'

// XRegExps compile to RegExps and work with native methods
date.test('2021-02-22');
// -> true
// However, named captures must be referenced using numbered backreferences
// if used with native methods
let m4 = '2021-02-22'.replace(date, '$2/$3/$1');
// -> '02/22/2021'
console.log(m4)

// Use XRegExp.forEach to extract every other digit from a string
const evens = [];
XRegExp.forEach('1a2345', /\d/, (match, i) => {
    if (i % 2) evens.push(+match[0]);
});
console.log(evens)
// evens -> [2, 4]

// Use XRegExp.matchChain to get numbers within <b> tags
let m5 = XRegExp.matchChain('1 <b>2</b> 3 <B>4 \n 56</B>', [
    XRegExp('<b>.*?</b>', 'is'),
    /\d+/
]);
// -> ['2', '4', '56']
console.log(m5)

// You can also pass forward and return specific backreferences
const html =
    `<a href="https://xregexp.com/">XRegExp</a>
     <a href="https://www.google.com/">Google</a>`;
let m6 = XRegExp.matchChain(html, [
    {regex: /<a href="([^"]+)">/i, backref: 1},
    {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]);
// -> ['xregexp.com', 'www.google.com']
console.log(m6)

// Merge strings and regexes, with updated backreferences
XRegExp.union(['m+a*n', /(bear)\1/, /(pig)\1/], 'i', {conjunction: 'or'});
// -> /m\+a\*n|(bear)\1|(pig)\2/i

// [ \t]*[^\n\r,]+[ \t]*(?:,|$)
*/

/*
let utf = XRegExp( '^(?<txt>[\\p{L}0-9\\- \\t]+)\:','u' ) 

let m7 = XRegExp.exec('Fjellø :', utf)
console.log(m7)



// [ \\t]*(?:,|\]|$])


let tempo = XRegExp( '(?<key>Tempo)[ \\t]*\:[ \\t]*(?<tempo>[0-9]{1,3})', 'xi' )


let m8 = XRegExp.exec(' Tempo: 230', tempo )

console.log(m8)





// \\p{L}0-9\- \\t



let meter = XRegExp( '(?<key>Meter)[ \\t]*\:[ \\t]*(?<counter>[0-9]{1,2})\/(?<denominator>[0-9]{1,2})', 'xi' )
let m11 = XRegExp.exec(' Meter : 4/4', meter  )

console.log(m11)

//[\],\s]

// let scale = XRegExp( '(?<key>Scale)[ \\t]*\:[ \\t]*(?<scale>[A-Za-z]+?)[ \\t]*(?:,|\]|$)', 'xi' )
// let m12 = XRegExp.exec('scale : Dorian ,   ', scale  )

// console.log(m12)


let scale = XRegExp( '(?<key>Scale)[ \\t]*\:[ \\t]*(?<note>[A|B|C|D|E|F|G|a|b|c|d|e|f|g])(?<sh_fl>[#|b]{0,1})[ \\t]*(?<mode>Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Locrian|Loc)[ \\t]*(?:,|\]|$)', 'xi' )
let m12 = XRegExp.exec('scale :  A Dorian ,   ', scale  )

console.log(m12)


let modes = XRegExp('(?<mode>Ionian|Ion|Dorian|Dor|Phygian|Phy|Lydian|Lyd|Mixolydian|mixo|mix|Aeolian|Aeo|Locrian|Loc])','i')
// let stave = = XRegExp( '(?<key>Stave|Staff)[ \\t]*\:[ \\t]*(?<counter>[0-9]{1,2})\/(?<denominator>[0-9]{1,2})', 'xi' )


// let scale = XRegExp( '(?<key>Scale)[ \\t]*\:[ \\t]*(?<note>[A|B|C|D|E|F|G|a|b|c|d|e|f|g][#|b]{0,1})[ \\t]*(?<_mode>[A-Za-z]+?)[ \\t]*(?:,|\]|$)', 'xi' )
// let m14 = XRegExp.exec('scale :  A Dorian ,   ', scale  )




// '^[ \t]+(?<ident>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?<COLON>\:)[ \\t]*(?<TXT>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?:,|\]|$)', 'xu' )  [ \\t]*(?:\]|$)





// let section2 = XRegExp( '^[ \t]*(?<ident>[\\p{L}][\\p{L}]0-9\\- \\t]+?)[ \\t]*(?<colon>[\:])', 'xui' )


//let m15 = XRegExp.exec('Title :    ' , section2  )

// console.log(m15)


let sheet = XRegExp( '^[ \t]*(?<ident>Title|Author)[ \\t]*(?<colon>[\:])[ \\t]*(?<text>[^\|\[][\\p{L}0-9\\- \\t]+?)[ \\t]*(?:$)', 'xui' )
let m10 = XRegExp.exec(' Author: My name is ', sheet  )

console.log(m10)



let staveLA = XRegExp( '^[ \t]*(?:\|)')

let m16 = XRegExp.exec('   | ', staveLA  )

console.log(m16)


let section = XRegExp( '^[ \\t]*(?<ident>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?:\:)', 'xu' )

let m9 = XRegExp.exec(' My own section 1 :', section )

console.log(m9)
*/
/*
let m16 = XRegExp.matchChain('Fjellø :  A Posix name  ', [
    {regex: scale, backref: 3},
    {regex: modes }
]);

console.log(m14)
*/

/*
let st = XRegExp( '(?<=^|\:)(?<ws>[ \\t]*)(?:[\[\|])','xu' )

console.log(XRegExp.exec(' |: ', st ) )


let FORM = XRegExp( '(?<=^[ \\t]*)(?<token>[f|F]orm)[ \\t]*\:[ \\t](?:$)' )

console.log(XRegExp.exec('form   : ', FORM) )
  
let LIST_ENTRY = XRegExp( '(?<=^[ \\t]*)(?<token>\-)[ \\t]*(?<ident>[\\p{L}0-9\\- \\t]+?)[ \\t](?:$)')


let m20 = XRegExp.exec('- MyListEntry ', LIST_ENTRY) 

console.log( `${JSON.stringify(m20.groups, undefined,2)}`)


let space = XRegExp('(?<value>[ \\t]+)')

console.log(XRegExp.exec('      ', space) )
*/
let author = XRegExp( '(?<ident>Author)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?=$|\\n)', 'xuig')
let title  = XRegExp( '(?<ident>Title)[ \\t]*(?<colon>:)[ \\t]*(?<value>[\\p{L}0-9\\- \\t]+?)[ \\t]*(?=$|\\n)', 'xuig')
let res = XRegExp.exec(` Author: Niels Mathisen               
Title : Angie`, author, 1, 'sticky') 

console.log(res)
console.log( `New index: ${author.lastIndex}`)

let res1 = XRegExp.exec(` Author: Niels Mathisen               
Title : Angie`, title, author.lastIndex + 1, 'sticky')

console.log( ` Author: Niels Mathisen               
Title : Angie`.substring(author.lastIndex+1 ) )
console.log(res1)
console.log( `New index: ${title.lastIndex}`)


let formStr = `Form:
  - Intro
  - Verse
 ...`

 let form = XRegExp( '(?<token>Form)[ \\t]*(?<colon>:)[ \\t]*(?=$|\\n)', 'gi' )

 let res2 = XRegExp.exec(formStr, form, 0, 'sticky')

console.log(res2)
console.log( `New index: ${form.lastIndex}`)


let chordNote = XRegExp('(?<value>A|B|C|D|E|F|G)(?<sharpFlat>[#|b]{0,1})', 'xg')




let res3 = XRegExp.exec('Am |  E7 |  Gsus4 G Fsus4 F |', chordNote, 0, 'sticky')
console.log(res3)
console.log( `New index: ${chordNote.lastIndex}`)


let txt = XRegExp( '(?<=^[ \\t]*)(?<value>[^\|\-|\:][^\|\:]+?)[ \\t]*(?=$|\\n)', 'xug' )
let res4 = XRegExp.exec('\n  _ Angie, _ Angie._ When _will those _dark clouds _ all disap-_pe_er?', txt, 3, 'sticky')
console.log(res4)
console.log( `New index: ${txt.lastIndex}`)

/*
let EOV = XRegExp('(?<token>Use)[ \\t]*(?<colon>[\:])[ \\t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?:[,\\]$])', 'xui')

let eovRes = XRegExp.exec(' USE: Niels Mathisen]', EOV, 1, 'sticky')
console.log(eovRes )

let textNote = XRegExp('(?<token> Note)[ \t]*\:[ \t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?:[,\\]$])', 'xui')
let tnRes = XRegExp.exec(' Note: Niels Mathisen sad på grisen]', textNote, 1, 'sticky')
console.log( tnRes )

let tn2 = XRegExp('(?<token> @)(?<who>[\\p{L}0-9\- \\t]+?)[ \t]*(?<colon>[\:])[ \t]*(?<value>[\\p{L}0-9\- \\t]+?)[ \\t]*(?:[,\\]]|$)', 'xui')
let tn2Res = XRegExp.exec(' @sloppy bassman : Keep in sync      ', tn2, 1, 'sticky')
console.log( tn2Res )


let REPEAT_COUNT = XRegExp('(?<=\|[ \\t]*)(?<value>[1-9]{0,2})[ \\t]*(?<colon>[\:]){1,2}')
let rcRes = XRegExp.exec('|  2 :', REPEAT_COUNT, 3, 'sticky')
console.log( rcRes )    
let REPEAT_END_COUNT =  XRegExp('(?<colon>[\:]{1,2})[ \\t]*(?<value>[1-9]{0,2})(?=[ \\t]*\|)'),
recRes = XRegExp.exec(' :  3 | ',REPEAT_END_COUNT, 1, 'sticky')
console.log( recRes )   


let chExt = XRegExp('(?<value>b5|6|7|9|b9|#9|11|#11|b13|13)')

let chRes = XRegExp.exec('b9', chExt, 0, 'sticky')
console.log( chRes ) 
*/
