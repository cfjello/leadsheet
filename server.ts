import { opine, Router, } from "https://deno.land/x/opine@2.2.0/mod.ts";
// import  { Request, Response, NextFunction } from "https://deno.land/x/opine@0.21.2/src/types.ts";
import * as path from "https://deno.land/std@0.128.0/path/mod.ts";
// import  { renderFileToString } from "https://deno.land/x/dejs@0.8.0/mod.ts"

import { LeadSheetPetite } from "./LeadSheetPetite.ts";


const __dirname = path.dirname(import.meta.url);

console.log(`DIRNAME: ${__dirname}`)

// Initialize main page
const LS = new LeadSheetPetite()
LS.loadAllSheets()
LS.parseAllSheets()
// LS.renderVextab('Angie')


const app = opine();
// Add Access Control Allow Origin headers
app.use((req, res, next) => {
  res.set( {
    "Access-Control-Allow-Origin" : "*",
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
    'content-type': 'application/json'
  });

  next();
});
const songRouter = Router();
const indexRouter = Router();

// Add our /cats route to the v1 API router
// for retrieving a list of all the cats.
songRouter.get("/sheet/:name", (req, res) => {
    console.log(`Server GOT request for Sheet`)
  if ( ! req.params.name ) {  // TODO: check later - || ! LS.menuList.includes(req.params.name)
      console.log(`Server Unknown Song Error for: ${req.params.name}`) 
      res.setStatus(400).json({
        success: "false",
        data: 'Unknown Song',
      });
  }
  else { // We have a song
      console.log(`Server to send ${req.params.name} sheet data`)
      const data = LS.getSheet(req.params.name)
      console.log(`Server sends: ${JSON.stringify(data)} sheet data`)
      res.setStatus(200).json({
        success: "true",
        data: data,
      });
  }
});

songRouter.get("/menu", (req, res) => {
    console.log(`Server GOT request for MenuItems`)
  if ( ! LS.menuList) {
      console.log(`Server cannot find the Menu List`) 
      res.setStatus(400).json({
        success: "false",
        data: 'No Menu List',
      });
  }
  else { // We have a song
      console.log(`Server to send Menu List data`)
      res.setStatus(200).json({
        success: "true",
        data: LS.getMenuItems(),
      });
  }
});

/*
songRouter.get("/sections", (req, res) => {
    console.log(`Server GOT request for MenuItems`)
  if ( ! LS.menuList) {
      console.log(`Server cannot find the Menu List`) 
      res.setStatus(400).json({
        success: "false",
        data: 'No Menu List',
      });
  }
  else { // We have a song
      console.log(`Server to send Menu List data`)
      res.setStatus(200).json({
        success: "true",
        data: LS.getMenuItems(),
      });
  }
});
*/

// GET home page.
songRouter.get("/", (req, res, next) => {
    res.sendFile( path.join(__dirname,"./html/LeadSheetPetite.html").normalize() )
});

indexRouter.get('/', (req, res, next) => {
    res.sendFile( path.join(__dirname,"./html/LeadSheetPetite.html").normalize() )
})

// Mount the v1 API routers onto our server
app.use("/api/v1", songRouter);
app.use("/", indexRouter)

const PORT = parseInt(Deno.env.get("OPINE_PORT") ?? "3000");

// Start our server on the desired port.
app.listen(PORT);

console.log(`API server running on port ${PORT}`);