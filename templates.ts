import { ArgsObject } from "./interfaces.ts";
import { tmplFac } from "./tmplFac.ts";

//  (tpls.get(name) as (a: ArgsObject) => string 

const tpls = new Map<string, any>([
    ['petite-vue-app', tmplFac(
    `<script type="module">
        import { createApp } from 'https://unpkg.com/petite-vue?module'
        createApp().mount()
    </script>`)],

    ['vextabDivHeader', tmplFac(
    `<div style="width: 1140px; margin-left: auto; margin-right: auto;"> 
    <div class="vextab-auto"  scale=1>`)],

    ['vextabHeader', tmplFac(
    `options font-size=§{fontSize} space=§{space} width=§{width}
    tabstave notation=true tablature=false time=§{timeSig} clef=percussion`)],

    ['vextabEndDiv', tmplFac(`</div> 
</div><!---end §{name} --->`)],

    ['H1', tmplFac(`<h2 class="vextitle">§{name}: §{value}</h2>`)],
    ['H2', tmplFac(`<h3 class="vexsubtitle">§{name}: §{value}</h3>`)],
    ['SECTION', tmplFac(`<h3 class="vexsection" id="§{name}"> §{name}:</h3>`)],
    
    // ['FORM', tmplFac(`<p class="vexform">§{name}:`)],

    ['LIST_ENTRY', tmplFac(`<a class="vexformentry" href="#§{name}">§{name}</a>`)],
    // ['FORM_END', tmplFac(`</p>`)],

    ['vebtabHtmlHeader',tmplFac(`<head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description"
      content="Vextab is a JavaScript library for rendering standard music notation and guitar tab.">
    <meta charset="UTF-8" />
    <link href='https://fonts.googleapis.com/css?family=Barlow|Tangerine' rel='stylesheet' type='text/css'>
    <link href="https://www.vexflow.com/style.css" media="screen" rel="Stylesheet" type="text/css" />
    <!-- Support Sources -->
    <script src="https://unpkg.com/vextab/releases/div.prod.js"></script>
    <!--Style CSS-->
    <style>
        p.vexform {
            font-size: 24px;
            margin: 10px;
            padding: 2px;
            color: black;
        }
        .vexformentry {
            font-style: italic;
            font-size: 20px;
            margin: 10px;
            padding: 2px;
            color: black;
        }
        body {
            margin-top: 100px;
            margin-bottom: 100px;
            margin-right: 100px;
            margin-left: 10px;
          }
    </style>
  </head>
  <body class="vexbody">`)]
])

// { fontSize: '15', space: '2', timeSig: '120' }
let debug = false

export const getTmpl = ( name: string, argsObj: ArgsObject ): string => {
    let res = ''
    try {
        //
        // Fetch the named template function and 
        // call it with the arguments object
        //
        const func =  tpls.get(name) as (a: ArgsObject) => string
        if ( debug ) console.log (`name: ${name}, func -> ${typeof func}`)
        if ( debug ) console.log (` func ARGS -> ${JSON.stringify(argsObj)}`)
        res  = func(argsObj!) as string
    }
    catch(err) {
        console.log(err)
    }
    return res as string
}
