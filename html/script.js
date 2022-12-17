new Vue({
    el: "#vueRoot",
    data() {
        return  {
            baseURL:  "http:localhost:3000/api/v1",  
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
                sectionsCP: [],
                textOnly: {},
                render: {}
            } ,
            showVextab: true,
        }
    },     
    // mounted() {
    //     this.init() 
    // },
    beforeMount() {
        this.init() 
    },
    updated() {
        if ( this.sheet.header.title !== 'unknown' ) this.renderSheet()
    },
    methods: {
        dummyFunc() {
            console.log(`I am this.dummyFunc()`)
        },
        fetchMenu() {
            fetch('${this.baseUrl}/menu')
            .then ( response => response.json() )
            .then ( resData => {
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
                    fetch( `${this.baseUrl}/sheet/${name}`)
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
        renderVextabSection( key, value ) {
            try {
                console.log(`RENDER Section: "${key}" for: ${value}`)
                const Renderer = Vex.Flow.Renderer;
                // Create VexFlow Renderer from canvas element with id #boo
                const target = document.getElementById(key)
                let child = target.lastElementChild; 
                while ( child ) {
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
            // deno-lint-ignore no-this-alias
            const self = this
            try {
                console.log(`RENDER SHEET`)
                this.sheet.sections.forEach( ( section )  => {
                    if ( section.value.length < 1 )  console.error(`renderSheet() has no notes entry for ${section}` )
                    console.log(`RENDER SECTION: ${JSON.stringify(section, undefined, 2)}`)
                    const render = this.sheet.render[section.name]
                    if ( render === 'textAndNotes' || render === 'notesOnly' ) {
                        const vex = []
                        section.value.forEach(line => {
                           if ( line.startsWith('notes') ) {
                                vex.push('options font-size=14 space=15, width=1040') 
                                vex.push(`tabstave notation=true tablature=false time=4/4 clef=percussion`)
                            }
                            vex.push(line)
                        })
                        self.renderVextabSection(section.name, vex.join('\n'))
                    }
                    else if ( render === 'textOnly' ) {
                        if ( this.sheet.textOnly[section.name].length > 0 ) 
                            document.getElementById(section.name).innerHTML = `<pre style="font-size: 20px">${this.sheet.textOnly[section.name].join('\n')}</pre>`
                        else 
                            throw Error(`Section ${section.name} is "textOnly", but has no this.sheet.textOnly entry`)
                    }
                    else {
                        throw Error(`renderSheet. undefide value for render: ${render} - should be "textOnly | notesOnly | textAndNotes"`)
                    }
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