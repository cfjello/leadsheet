import { opine, Router, serveStatic } from "https://deno.land/x/opine@2.2.0/mod.ts";
// import  { Request, Response, NextFunction } from "https://deno.land/x/opine@0.21.2/src/types.ts";
import * as path from "https://deno.land/std@0.128.0/path/mod.ts";

import { LeadSheet } from "./LeadSheet.ts";
import { _ } from './lodash.ts';

const __dirname = path.dirname(import.meta.url);

// Initialize main page
const LS = new LeadSheet()
LS.debug = false
await LS.loadAllSheets()
// LS.parseAllSheets()


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

app.use(serveStatic(path.join(__dirname,"./html").normalize()))
const songRouter = Router();
const htmlRouter = Router();
// const jsRouter =   Router();

// GET home page.

htmlRouter.get("/", (req, res, next) => {
    const fileName = path.join(__dirname,"./html/LeadSheetVue.html").normalize()
    console.log(`Server sends file: ${fileName}`)
    res.set( { 'content-type': 'text/html'} )
    res.sendFile(fileName)
});

htmlRouter.get("/html/favicon.png", (req, res, next) => {
  const fileName = path.join(__dirname,"./html/favicon.png").normalize()
  console.log(`Server sends file: ${fileName}`)
  res.set( { 'content-type': 'image/svg+xml'} )
  res.sendFile(fileName)
});

// Serve Song Pages
songRouter.get("/sheet/:name", async (req, res) => {
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
      const data = await LS.getRestSheet(req.params.name)
      // Deno.writeTextFile('./log.txt',`${JSON.stringify(data, undefined, 2)}`, { append: false} )
      // res.set( { 'content-type': 'application/json'} )
      res.setStatus(200).json({
        success: "true",
        data: data,
      });
  }
});

// Serve Menu Items
songRouter.get("/menu", async (req, res) => {
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
      // res.set( { 'content-type': 'application/json'} )
      res.setStatus(200).json({
        success: "true",
        data: await LS.getMenuItems(),
      });
  }
});

// Mount the v1 API routers onto our server
app.use("/api/v1", songRouter);
app.use("/", htmlRouter)
// app.use("/", jsRouter)

const PORT = parseInt(Deno.env.get("OPINE_PORT") ?? "3000");

// Start our server on the desired port.
app.listen(PORT);

console.log(`API server running on port ${PORT}`);