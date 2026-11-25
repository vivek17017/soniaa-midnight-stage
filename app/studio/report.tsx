"use client";
import {useCallback,useEffect,useState} from "react";
import {intents,topicLabels,type Intent,type Topic} from "@/lib/portfolio";

type Summary={
  events:{topic:Topic;event:string;count:number}[];
  outcomes:{topic:Topic;visits:number;count:number}[];
  intents:{intent:Intent;count:number}[];
  inbox:{id:string;created_at:number;name:string;email:string;intent:Intent;topic:Topic;message:string;notification:string;attempted_at:number}[];
};
const states:Record<string,string>={pending:"Waiting for email setup",sending:"Sending notification",accepted:"Accepted by email provider",activation:"Inbox activation requested",retry:"Saved · email retry needed"};
export default function Report({localPreview = false}:{localPreview?:boolean}) {
  const [data,setData]=useState<Summary|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const refresh=useCallback(async()=>{
    setBusy(true);setError("");
    try{const response=await fetch("/api/studio",{cache:"no-store"});if(!response.ok)throw new Error();setData(await response.json());}catch{setError("Could not load the private report. Please refresh after signing in with the owner account.");}finally{setBusy(false);}
  },[]);
  useEffect(()=>{void refresh();},[refresh]);
  async function retry(id:string) {
    setBusy(true);
    try {const r=await fetch("/api/studio",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(!r.ok)throw new Error();await refresh();}
    catch {setError("The notification could not be retried.");setBusy(false);}
  }
  const count=(topic:Topic,event:string)=>data?.events.find(e=>e.topic===topic&&e.event===event)?.count||0;
  return <>
    <div className="refresh"><span>Last 30 days</span><button className="underlink" disabled={busy} onClick={refresh}>{busy?"Loading…":"Refresh report"}</button></div>{error&&<p role="alert">{error}</p>}
    {data&&<><h2>Engagement</h2><p>{count("direct","visit")} recorded visits. A visit counts once at each step for each topic. Saved messages are counted individually.</p>
    <div className="table-scroll"><table><thead><tr><th scope="col">Topic</th><th scope="col">Story views</th><th scope="col">Form starts</th><th scope="col">Visits with an enquiry</th><th scope="col">Messages</th></tr></thead><tbody>{(Object.keys(topicLabels) as Topic[]).map(t=><tr key={t}><th scope="row">{topicLabels[t]}</th><td>{t==="direct"?"—":count(t,"story_open")}</td><td>{count(t,"form_start")}</td><td>{data.outcomes.find(e=>e.topic===t)?.visits||0}</td><td>{data.outcomes.find(e=>e.topic===t)?.count||0}</td></tr>)}</tbody></table></div>
    <h2>Reasons for reaching out</h2><div className="table-scroll"><table><tbody>{(Object.keys(intents) as Intent[]).map(k=><tr key={k}><th scope="row">{intents[k]}</th><td>{data.intents.find(e=>e.intent===k)?.count||0}</td></tr>)}</tbody></table></div>
    <h2>Enquiry inbox</h2><p>{data.inbox.length?"Most recent 30 enquiries. Open a message to see contact details and notification status.":"New enquiries will appear here."}</p>
    {data.inbox.map(row=><details className="inbox-entry" key={row.id}><summary><strong>{row.name}</strong><small>{intents[row.intent]} · {new Date(row.created_at).toLocaleDateString()}</small></summary><p>{topicLabels[row.topic]} · <a className="underlink" href={"mailto:"+row.email}>{row.email}</a></p><p className="message">{row.message}</p><small>{localPreview ? "Saved on this computer" : states[row.notification]||"Saved"}{row.notification==="activation"?" · Check your inbox for FormSubmit’s activation message.":""}</small>
    {!localPreview&&row.notification==="pending"&&<p>To enable email, save a Resend sending key as <code>RESEND_API_KEY</code> in <a className="underlink" href="https://supabase.com/dashboard/project/qeczeqmpcgraylnazhlt/functions/secrets" target="_blank" rel="noreferrer">Soniaa’s Supabase secrets</a>, then retry the notification.</p>}
    {!localPreview&&(row.notification==="activation"||row.notification==="retry"||row.notification==="pending"||(row.notification==="sending"&&row.attempted_at<Date.now()-120000))&&<div><button className="button secondary detail-button" disabled={busy} onClick={()=>retry(row.id)}>Retry notification</button></div>}</details>)}</>}
  </>;
}
