import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";

const root = "http://127.0.0.1:5173";
const visit = randomUUID();
const id = randomUUID();
const post = (path,payload) => fetch(root + path,{
  method:"POST", redirect:"manual",
  headers:{"Content-Type":"application/json","Origin":root},
  body:JSON.stringify(payload),
});
const home = await fetch(root + "/");
assert.equal(home.status,200);
const page = await home.text();
for (const fragment of ["Crafting Brands","78182867","3CxV1B5H-KI"]) assert.ok(page.includes(fragment));
assert.equal((await fetch(root + "/api/studio")).status,403);
assert.equal((await post("/api/enquiries",{})).status,422);
for (const [event,topic] of [["visit","direct"],["story_open","leadership"],["form_start","leadership"],["story_open","leadership"]]) {
  assert.equal((await post("/api/events",{visit,event,topic})).status,204);
}
const enquiry = {id,visit,name:"Local milestone test",email:"local-"+id+"@example.test",intent:"hiring",topic:"leadership",message:"Local verification of the leadership enquiry.",website:""};
const saved = await post("/api/enquiries",enquiry);
assert.equal(saved.status,201,"The app should save a new enquiry");
assert.equal((await saved.json()).reference,id);
assert.equal((await post("/api/enquiries",enquiry)).status,200);
assert.equal((await post("/api/enquiries",{...enquiry,message:"Updated test message."})).status,409);
const login = await fetch(root + "/signin-with-chatgpt?return_to=/studio",{redirect:"manual"});
assert.equal(login.status,302);
const cookie = login.headers.get("set-cookie")?.split(";")[0];
assert.ok(cookie,"Local owner sign-in should set a cookie");
const report = await fetch(root + "/api/studio",{headers:{Cookie:cookie}});
assert.equal(report.status,200);
const data = await report.json();
const matches = data.inbox.filter(message=>message.id===id);
assert.equal(matches.length,1);
assert.equal(matches[0].topic,enquiry.topic);
assert.equal(matches[0].intent,enquiry.intent);
assert.ok(data.events.some(item=>item.topic==="leadership"&&item.event==="form_start"&&item.count>=1));
assert.ok(data.outcomes.some(item=>item.topic==="leadership"&&item.count>=1));
console.log("PASS · homepage, media links, analytics, validation, save, duplicate handling, local sign-in and owner report.");
console.log("Saved one labelled local test enquiry. Reference "+id);
