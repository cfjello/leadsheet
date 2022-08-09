new Vue({
    el: "#vueRoot",
    data() {
        return  {
            baseUrl:  "http:localhost:3000/api/v1",  
            /* vexHeader: [ 
                'options font-size=14 space=15, width=840', 
                `tabstave notation=true tablature=false time=4/4 clef=percussion`
            ],
            */
            menu: [{ menuItem: 'Dummy', menuRef: 'Dummy' }],
            sheet:  { 
                header: { 
                    title: 'unknown', 
                    author: 'unknown', 
                    key: 'C', 
                    tempo: 120, 
                    meter: {counter:4, denominator: 4}, 
                    form: ['Intro'] 
                },
                sections: [],
                sectionsCP: []
            } ,
        }
    },     
    mounted() {
        this.init() 
    },
    updated() {
        console.log(`Into Updated`)
        if ( this.sheet.header.title !== 'unknown' ) this.renderSheet()
    },
    methods: {
        dummyFunc() {
            console.log(`I am this.dummyFunc()`)
        },
        fetchMenu() {
            fetch('http:localhost:3000/api/v1/menu')
            .then ( response => response.json() )
            .then ( resData => {
                console.log( `INIT Menu is: ${JSON.stringify(this.menu)}`)
                console.log( `resData is now: ${JSON.stringify(resData)}`)
                resData.data.forEach( (value, idx) => Vue.set( this.menu, idx, { menuItem: value.menuItem, menuRef: value.menuRef } ) )
                console.log( `INIT Menu is now: ${JSON.stringify(this.menu)}`)
            }).catch(err => {
                console.log(err)
            })
        },
        fetchSheet(name) {
            name = name === undefined ? 'Default' : name
            console.log(`Vue to request Sheet: ${name} from server`)
                try {
                    fetch( `http:localhost:3000/api/v1/sheet/${name}`)
                    .then ( response => response.json() )
                    .then ( resData => { 
                        this.sheet = resData.data
                        console.log(`NEW SHEET: ${JSON.stringify(this.sheet)}`)
                        // this.rendered = false
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
                catch (err) { console.log(err) }
        },
        renderSection( key, value ) {
            try {
                console.log(`RENDER Section: "${key}" for: ${value}`)
                const Renderer = Vex.Flow.Renderer;
                // Create VexFlow Renderer from canvas element with id #boo
                const target = document.getElementById(key)
                let child = target.lastElementChild; 
                let i = 0
                while (child) {
                    target.removeChild(child);
                    child = target.lastElementChild;
                }
                const renderer = new Renderer(
                    target,
                    Renderer.Backends.SVG
                );
                // Initialize VexTab artist and parser.
                const artist = new vextab.Artist(14, 15, 200, { scale: 1 });
                const tab = new vextab.VexTab(artist);
                tab.parse(value);
                artist.render(renderer);
                // return document.getElementById('renderDiv').innerHTML
            } catch (e) {
                console.error(e);
            }
        }, 
        renderSheet() {
            // no-this-alias
            const self = this
            try {
                console.log(`RENDER SHEET`)
                this.sheet.sections.forEach( function (elem) {
                    const vex = []
                    elem.value.forEach(line => {
                        if ( line.startsWith('notes') ) {
                            vex.push('options font-size=14 space=15, width=1040') 
                            vex.push(`tabstave notation=true tablature=false time=4/4 clef=percussion`)
                        }
                        vex.push(line)
                    })
                    self.renderSection(elem.name, vex.join(`\n`))
                })
                // this.rendered = true
            }
            catch (err) { console.log(err) }
        },
        renderCPSheet() {
            try {
                console.log(`RENDER CP SHEET`)
                this.sheet.sectionsCP.forEach( function (elem) {
                    document.getElementById(key).innerHTML = `<pre>${elem.value.join(`\n`)}</pre>`
                })
            }
            catch (err) { console.log(err) }
        },
        init() {
            try {
                console.log('Running Init()')
                this.fetchMenu()
                this.fetchSheet('Default')
            }
            catch (err) { console.log(err) }
        }
    }
});  