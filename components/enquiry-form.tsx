"use client";
import { useRef, useState, type FormEvent } from "react";
import { intents, topicLabels, type Intent, type Topic } from "@/lib/portfolio";
import { visit, track } from "@/lib/visits";

export type Context = {topic:Topic; intent:Intent};
export default function EnquiryForm({context, changeContext}: {context:Context; changeContext:(c:Context)=>void}) {
  const [status,setStatus] = useState<"idle"|"sending"|"saved"|"error">("idle");
  const [error,setError] = useState("");
  const previous = useRef({key:"",id:""});
  const inFlight = useRef(false);
  const confirmation = useRef<HTMLDivElement>(null);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form=event.currentTarget, fields=new FormData(form);
    const data={name:String(fields.get("name")||""),email:String(fields.get("email")||""),message:String(fields.get("message")||""),website:String(fields.get("website")||""),...context};
    const key=JSON.stringify(data);
    if (previous.current.key!==key) previous.current={key,id:crypto.randomUUID()};
    inFlight.current=true;
    setStatus("sending");setError("");track("form_start",context.topic);
    try {
      const res=await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,id:previous.current.id,visit:visit()})});
      const result=await res.json() as {saved?:boolean;error?:string};
      if(!res.ok || !result.saved) throw new Error(result.error || "We couldn’t confirm your enquiry. Please try again.");
      setStatus("saved");requestAnimationFrame(()=>confirmation.current?.focus());
    } catch(err) {setError(err instanceof TypeError ? "Connection interrupted. Your draft is here. Please try again." : err instanceof Error ? err.message : "Please try again.");setStatus("error");}
    finally {inFlight.current=false;}
  }
  if(status==="saved")return <div ref={confirmation} tabIndex={-1} role="status" className="contact-receipt"><span className="receipt-tick" aria-hidden="true">✓</span><h3>Enquiry received.</h3><p>Thank you for sharing what you have in mind. Your message has been saved.</p><button className="underlink" onClick={()=>{previous.current={key:"",id:""};setStatus("idle")}}>Write another message</button></div>;
  return <form className="enquiry-form" onSubmit={submit} onFocusCapture={()=>track("form_start",context.topic)}>
    <fieldset disabled={status==="sending"}>
      <div className="pair"><label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label><label>Reply email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label></div>
      <div className="pair"><label>Reason for reaching out<select value={context.intent} onChange={e=>changeContext({...context,intent:e.target.value as Intent})}>{Object.entries(intents).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <label>Subject<select value={context.topic} onChange={e=>{const t=e.target.value as Topic;changeContext({...context,topic:t});track("form_start",t)}}>{Object.entries(topicLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div>
      <label>Your message<textarea name="message" placeholder="What would you like to explore together?" rows={4} minLength={5} maxLength={4000} required/></label>
      <div className="visually-hidden" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      {error&&<p className="form-error" role="alert">{error}</p>}
      <button className="button primary" type="submit">{status==="sending"?"Saving your enquiry…":"Send enquiry"}</button>
    </fieldset>
  </form>;
}
