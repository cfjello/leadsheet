// import { opine, Router, } from "https://deno.land/x/opine@2.2.0/mod.ts";7
// import  { Request, Response, NextFunction } from "https://deno.land/x/opine@0.21.2/src/types.ts";
import express from "npm:express"
import * as path from "https://deno.land/std@0.128.0/path/mod.ts";

import { LeadSheet } from "./LeadSheet.ts";
import { _ } from './lodash.ts';

const __dirname = path.dirname(import.meta.url);

// Initialize main page
const LS = new LeadSheet()
// LS.debug = true
LS.loadAllSheets()
// LS.parseAllSheets()


const app = express();
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
const songRouter = express.Router();
const indexRouter = express.Router();
const jsRouter = express.Router();
//
// Serve Main Page

// GET home page.
songRouter.get("/", (req, res, next) => {
  const fileName = path.join(__dirname,"./html/LeadSheetVue.html").normalize()
  console.log(`Server sends file: ${fileName}`)
  res.set( { 'content-type': 'text/html'} )
  res.sendFile( path.join(__dirname, fileName ) )
});

// GET js file
jsRouter.get("/html/script.js", (req, res, next) => {
  const fileName = path.join(__dirname,"./html/script.js").normalize()
  console.log(`Server sends file: ${fileName}`)
  res.set( { 'content-type':  'application/json'} )
  res.sendFile( path.join(__dirname, fileName ) )
});


/*
songRouter.get("/", (req, res) => {
  console.log(`Server GOT request for Main Page`)
    // res.sendFile(path.join(__dirname, '/index.html'));
    const htmlFile = path.join(__dirname, './html/leadSheetVue.html').normalize()
    console.log(`Sending Page: ${htmlFile}`)
    // res.setStatus(200).sendFile(htmlFile)
});
*/ 

// Serve Song Pages
songRouter.get("/sheet/:name", (req, res) => {
    console.log(`Server GOT request for Sheet`)
  if ( ! req.params.name ) {  // TODO: check later - || ! LS.menuList.includes(req.params.name)
      console.log(`Server Unknown Song Error for: ${req.params.name}`) 
      res.status(400).json({
        success: "false",
        data: 'Unknown Song',
      });
  }
  else { // We have a song
      console.log(`Server to send ${req.params.name} sheet data`)
      const data = LS.getRestSheet(req.params.name)
      // Deno.writeTextFile('./log.txt',`${JSON.stringify(data, undefined, 2)}`, { append: false} )
      res.status(200).json({
        success: "true",
        data: data,
      });
  }
});

// Serve Menu Items
songRouter.get("/menu", (req, res) => {
    console.log(`Server GOT request for MenuItems`)
  if ( ! LS.menuList) {
      console.log(`Server cannot find the Menu List`) 
      res.status(400).json({
        success: "false",
        data: 'No Menu List',
      });
  }
  else { // We have a song
      console.log(`Server to send Menu List data`)
      res.status(200).json({
        success: "true",
        data: LS.getMenuItems(),
      });
  }
});

songRouter.get("/test", (req, res) => {
  console.log(`Server GOT request for menuItems`)
    res.status(200).json({
      success: "true",
      data: testData,
    });
});

const testData = [
  {
    id: "1",
    employee_name: "Tiger Nixon",
    employee_salary: "320800",
    employee_age: "61",
    profile_image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: "2",
    employee_name: "Garrett Winters",
    employee_salary: "170750",
    employee_age: "63",
    profile_image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    employee_name: "Ashton Cox",
    employee_salary: "86000",
    employee_age: "66",
    profile_image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: "4",
    employee_name: "Cedric Kelly",
    employee_salary: "433060",
    employee_age: "22",
    profile_image: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: "5",
    employee_name: "Airi Satou",
    employee_salary: "162700",
    employee_age: "33",
    profile_image: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    id: "6",
    employee_name: "Brielle Williamson",
    employee_salary: "372000",
    employee_age: "61",
    profile_image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    id: "7",
    employee_name: "Herrod Chandler",
    employee_salary: "137500",
    employee_age: "59",
    profile_image: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    id: "8",
    employee_name: "Rhona Davidson",
    employee_salary: "327900",
    employee_age: "55",
    profile_image: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    id: "9",
    employee_name: "Colleen Hurst",
    employee_salary: "205500",
    employee_age: "39",
    profile_image: "https://randomuser.me/api/portraits/women/9.jpg",
  },
  {
    id: "10",
    employee_name: "Sonya Frost",
    employee_salary: "103600",
    employee_age: "23",
    profile_image: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    id: "11",
    employee_name: "Jena Gaines",
    employee_salary: "90560",
    employee_age: "30",
    profile_image: "https://randomuser.me/api/portraits/women/11.jpg",
  },
  {
    id: "12",
    employee_name: "Quinn Flynn",
    employee_salary: "342000",
    employee_age: "22",
    profile_image: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: "13",
    employee_name: "Charde Marshall",
    employee_salary: "470600",
    employee_age: "36",
    profile_image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: "14",
    employee_name: "Haley Kennedy",
    employee_salary: "313500",
    employee_age: "43",
    profile_image: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    id: "15",
    employee_name: "Tatyana Fitzpatrick",
    employee_salary: "385750",
    employee_age: "19",
    profile_image: "https://randomuser.me/api/portraits/women/15.jpg",
  },
  {
    id: "16",
    employee_name: "Michael Silva",
    employee_salary: "198500",
    employee_age: "66",
    profile_image: "https://randomuser.me/api/portraits/men/16.jpg",
  },
  {
    id: "17",
    employee_name: "Paul Byrd",
    employee_salary: "725000",
    employee_age: "64",
    profile_image: "https://randomuser.me/api/portraits/men/17.jpg",
  },
  {
    id: "18",
    employee_name: "Gloria Little",
    employee_salary: "237500",
    employee_age: "59",
    profile_image: "https://randomuser.me/api/portraits/women/18.jpg",
  },
  {
    id: "19",
    employee_name: "Bradley Greer",
    employee_salary: "132000",
    employee_age: "41",
    profile_image: "https://randomuser.me/api/portraits/men/19.jpg",
  },
  {
    id: "20",
    employee_name: "Dai Rios",
    employee_salary: "217500",
    employee_age: "35",
    profile_image: "https://randomuser.me/api/portraits/men/20.jpg",
  },
  {
    id: "21",
    employee_name: "Jenette Caldwell",
    employee_salary: "345000",
    employee_age: "30",
    profile_image: "https://randomuser.me/api/portraits/women/21.jpg",
  },
  {
    id: "22",
    employee_name: "Yuri Berry",
    employee_salary: "675000",
    employee_age: "40",
    profile_image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: "23",
    employee_name: "Caesar Vance",
    employee_salary: "106450",
    employee_age: "21",
    profile_image: "https://randomuser.me/api/portraits/men/23.jpg",
  },
  {
    id: "24",
    employee_name: "Doris Wilder",
    employee_salary: "85600",
    employee_age: "23",
    profile_image: "https://randomuser.me/api/portraits/women/24.jpg",
  },
];

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

indexRouter.get('/', (req, res, next) => {
    res.sendFile( path.join(__dirname,"./html/LeadSheetPetite.html").normalize() )
})

// Mount the v1 API routers onto our server
app.use("/api/v1", songRouter);
app.use("/", indexRouter)

const PORT = parseInt(Deno.env.get("PORT") ?? "3000");

// Start our server on the desired port.
app.listen(PORT);

console.log(`API server running on port ${PORT}`);