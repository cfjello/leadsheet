import LeadSheet from "./LeadSheet.ts";

const leadSheet = new LeadSheet()


const encoderHtml = new TextEncoder();
const dataHtml = encoderHtml.encode( leadSheet.getMainPage().replaceAll('__@__', '$'));
Deno.writeFile( './leadsheet.html',dataHtml )
