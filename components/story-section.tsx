"use client";
import {useState,useEffect,useRef,type KeyboardEvent} from "react";
import {stories,type StoryKey} from "@/lib/portfolio";
import {track} from "@/lib/visits";
import type {Context} from "./enquiry-form";

const workId = "work";
function readTopic(hash:string) {
  return stories.find(story=>hash==="#work/"+story.key)?.key;
}
export default function StorySection({onConnect}:{onConnect:(c:Context)=>void}) {
  const [active,setActive]=useState<StoryKey|null>("brand");
  const [more,setMore]=useState(false);
  const [copyState,setCopyState]=useState<"idle"|"copied"|"manual">("idle");
  const panel=useRef<HTMLElement>(null);
  const buttons=useRef<Partial<Record<StoryKey,HTMLButtonElement|null>>>({});
  useEffect(()=>{
    const sync=()=>{
      const hash=location.hash,key=readTopic(hash);
      if(key || hash==="#work"){
        setActive(key??null);setMore(false);setCopyState("idle");
        requestAnimationFrame(()=>document.getElementById(workId)?.scrollIntoView({block:"start"}));
      } else if(!hash || hash==="#top") {setActive("brand");setMore(false);setCopyState("idle");}
    };
    sync();
    window.addEventListener("popstate",sync);window.addEventListener("hashchange",sync);
    return ()=>{window.removeEventListener("popstate",sync);window.removeEventListener("hashchange",sync);};
  },[]);
  useEffect(()=>{
    if(!panel.current||!active)return;
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){track("story_open",active);observer.disconnect();}},{threshold:0.2});
    observer.observe(panel.current);return ()=>observer.disconnect();
  },[active]);
  function choose(key:StoryKey|null) {
    const hash=key?"#work/"+key:"#work";
    if(location.hash!==hash)history.pushState(null,"",hash);
    setActive(key);setMore(false);setCopyState("idle");
  }
  function keys(e:KeyboardEvent<HTMLButtonElement>,index:number) {
    const next={ArrowRight:(index+1)%3,ArrowLeft:(index+2)%3,Home:0,End:2}[e.key];
    if(next===undefined)return;
    e.preventDefault();const key=stories[next].key;choose(key);buttons.current[key]?.focus();
  }
  async function copy(key:StoryKey) {
    try {await navigator.clipboard.writeText(location.origin+location.pathname+"#work/"+key);setCopyState("copied");}
    catch{setCopyState("manual");}
  }
  const activeIndex=stories.findIndex(s=>s.key===active);
  return <section className="section work-section" id="work" aria-labelledby="work-heading">
    <div className="section-heading"><h2 id="work-heading">What needs <em>clarity?</em></h2></div>
    <div className="story-grid" style={{"--active-index":Math.max(activeIndex,0),"--glow-opacity":active?1:0} as React.CSSProperties}>
      {stories.map((s,i)=><div className="story-choice" key={s.key}>
        <button ref={el=>{buttons.current[s.key]=el}} className="topic-button" id={"topic-"+s.key} aria-expanded={active===s.key} aria-controls={"story-"+s.key} onKeyDown={e=>keys(e,i)} onClick={()=>choose(active===s.key?null:s.key)}>
          {s.label}<span className="disclosure-mark" aria-hidden="true">{active===s.key?"−":"+"}</span>
        </button>
        <article id={"story-"+s.key} aria-labelledby={"topic-"+s.key} hidden={active!==s.key} ref={active===s.key?panel:undefined} className="story-sheet">
          <div className="story-main"><h3>{s.company}</h3><p className="story-role">{s.role}</p><p className="story-lead">{s.summary}</p></div>
          <div className="story-actions"><button className="button secondary" onClick={()=>setMore(v=>!v)} aria-expanded={more&&active===s.key}>{more&&active===s.key?"Close story details":"Read the story"}</button><a href="#connect" className="underlink" onClick={()=>onConnect({topic:s.key,intent:s.intent})}>{s.action}</a></div>
          {active===s.key && more && <div className="story-more"><h4>{s.question}</h4><p>{s.detail}</p><div className="story-tools"><button className="underlink" onClick={()=>{choose(null);buttons.current[s.key]?.focus()}}>Back to topics</button><button className="underlink" onClick={()=>copy(s.key)}>{copyState==="copied"?"Link copied":"Copy story link"}</button></div>{copyState==="manual"&&<input aria-label="Story link to copy" readOnly value={location.origin+location.pathname+"#work/"+s.key} onFocus={e=>e.target.select()}/>}</div>}
        </article>
      </div>)}
    </div>
  </section>;
}
