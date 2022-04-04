import { ArgsObject } from "./interfaces.ts";
import { tmplFac } from "./tmplFac.ts";

//  (tpls.get(name) as (a: ArgsObject) => string 

const tpls = new Map<string, any>([
    ['bs-header', tmplFac(`
    <!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    
        <!-- Bootstrap CSS -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.5.0/font/bootstrap-icons.css">
        <title>LeadSheet</title>
      </head>
    `)],
    ['bs-menu', tmplFac(`
    <style>
    #sidebar-nav {
        width: 160px;
    }
    </style>

      <div class="container-fluid">
        <div class="row flex-nowrap">
            <div class="col-auto px-0">
                <div id="sidebar" class="collapse collapse-horizontal show border-end">
                    <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100" v-for="(item, index) in songs">
                        §{menuItems}
                </div>
            </div>
            <main class="col ps-md-2 pt-2">
                <a href="#" data-bs-target="#sidebar" data-bs-toggle="collapse" class="border rounded-3 p-1 text-decoration-none"><i class="bi bi-list bi-lg py-2 p-1"></i> Menu</a>
                <div class="page-header pt-3">
                    <h2>Bootstrap 5 Sidebar Menu - Simple</h2>
                </div>
                <p class="lead">A offcanvas "push" vertical nav menu example.</p>
                <hr>
                <div class="row">
                    <div class="col-12">
                        <p>This is a simple collapsing sidebar menu for Bootstrap 5. Unlike the Offcanvas component that overlays the content, this sidebar will "push" the content. Sriracha biodiesel taxidermy organic post-ironic, Intelligentsia salvia mustache 90's code editing brunch. Butcher polaroid VHS art party, hashtag Brooklyn deep v PBR narwhal sustainable mixtape swag wolf squid tote bag. Tote bag cronut semiotics, raw denim deep v taxidermy messenger bag. Tofu YOLO Etsy, direct trade ethical Odd Future jean shorts paleo. Forage Shoreditch tousled aesthetic irony, street art organic Bushwick artisan cliche semiotics ugh synth chillwave meditation. Shabby chic lomo plaid vinyl chambray Vice. Vice sustainable cardigan, Williamsburg master cleanse hella DIY 90's blog.</p>
                        <p>Ethical Kickstarter PBR asymmetrical lo-fi. Dreamcatcher street art Carles, stumptown gluten-free Kickstarter artisan Wes Anderson wolf pug. Godard sustainable you probably haven't heard of them, vegan farm-to-table Williamsburg slow-carb readymade disrupt deep v. Meggings seitan Wes Anderson semiotics, cliche American Apparel whatever. Helvetica cray plaid, vegan brunch Banksy leggings +1 direct trade. Wayfarers codeply PBR selfies. Banh mi McSweeney's Shoreditch selfies, forage fingerstache food truck occupy YOLO Pitchfork fixie iPhone fanny pack art party Portland.</p>
                    </div>
                </div>
            </main>
        </div>
      </div>

    
    
    
    `)],
    ['bs-menu-item', tmplFac(`
        <a href="#" class="list-group-item border-end-0 d-inline-block text-truncate" data-bs-parent="#sidebar"><i class="bi bi-bootstrap"></i> <span>§{menuItem}</span> </a>
    `)],
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

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
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
  <body class="vexbody">
  <!-- Bootstrap -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
  `)]
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
