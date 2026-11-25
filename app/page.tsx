"use client";
import {useEffect,useState} from "react";
import {awards,credentials,education,experience,linkedin,recommendations,resources,services} from "@/lib/portfolio";
import {track} from "@/lib/visits";
import EnquiryForm,{type Context} from "@/components/enquiry-form";
import StorySection from "@/components/story-section";

function RecordRows({rows}:{rows:string[][]}) {
  return <ul className="record-rows">{rows.map(([date,role,org])=><li key={role+org}><span>{date}</span><div><strong>{role}</strong><small>{org}</small></div></li>)}</ul>;
}
export default function Home() {
  const [context,setContext]=useState<Context>({topic:"direct",intent:"project"});
  const [quote,setQuote]=useState(0);
  const q=recommendations[quote];
  useEffect(()=>{track("visit");},[]);
  return <>
    <a className="skip" href="#work">Skip to selected work</a>
    <div id="top"/>
    <header className="masthead"><div className="frame nav-frame">
      <a className="wordmark" href="#top" aria-label="Soniaa, home">Soniaa</a>
      <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a><a className="nav-connect" href="#connect">Connect</a></nav>
    </div></header>
    <main>
      <section className="stage" aria-labelledby="headline">
        <div className="stage-image" aria-hidden="true"/>
        <div className="stage-type"><p className="job-title">Fractional CMO</p><h1 id="headline">Crafting Brands<br/><em>People Can Feel</em></h1></div>
        <div className="stage-actions"><a className="button primary" href="#work">Explore my work</a><a className="button secondary" href="#connect">Let’s connect</a></div>
      </section>
      <div className="frame"><StorySection onConnect={setContext}/></div>
      <section className="about-band" id="about"><div className="frame about-grid"><div className="about-opening"><h2>A note from <em>Soniaa.</em></h2><p className="pull-quote">“I notice what others don’t.”</p></div>
        <div className="about-copy"><p>I’ve always been the kind of person who likes to understand things deeply and fix them from the root. That’s how I approach brand, demand, communication, and team leadership too.</p><p>I focus on simplicity, knowing what the business truly needs, how people think, and what steps will genuinely move things forward.</p><p className="signature">Soniaa</p></div></div></section>
      <section className="section frame background" aria-labelledby="background-heading"><div className="aside-title"><h2 id="background-heading">Professional <em>background.</em></h2><p>Gurugram, Haryana, India</p></div><div className="disclosures">
        {([["Experience",experience],["Education",education],["Honors & awards",awards],["Certifications",credentials]] as const).map(([label,rows])=><details key={label}><summary>{label}<span aria-hidden="true"/></summary><RecordRows rows={rows}/></details>)}
        <details><summary>Services<span aria-hidden="true"/></summary><ul className="service-list">{services.map(s=><li key={s}>{s}</li>)}</ul></details>
      </div></section>
      <section className="voices"><div className="frame voices-inner"><h2>From the people <em>I’ve worked with.</em></h2><div className="quote-body" key={quote} aria-live="polite"><blockquote>“{q.quote}”</blockquote><p><strong>{q.name}</strong><span>{q.source}</span></p></div><div className="voice-controls" role="group" aria-label="Choose a LinkedIn recommendation">{recommendations.map((person,i)=><button key={person.name} onClick={()=>setQuote(i)} aria-label={"Read recommendation from "+person.name} aria-pressed={i===quote}><span/></button>)}</div></div></section>
      <section className="section frame featured"><h2>Selected <em>resources.</em></h2><div className="resources">{resources.map(r=><a className="resource" key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"><div className="resource-img"><img src={"/assets/"+r.image+".webp"} alt="" loading="lazy" width={440} height={248}/></div><div className="resource-copy"><small>{r.format}</small><h3>{r.title}</h3><p>{r.description}</p><span className="underlink">{r.label}<span className="visually-hidden">, opens in a new tab</span></span></div></a>)}</div></section>
      <section id="connect" className="connect"><div className="frame connect-grid"><div><h2>Let’s <em>connect.</em></h2><p>Have a project, a role, or an invitation in mind?</p><a className="underlink" href={linkedin} rel="noopener noreferrer" target="_blank">Connect on LinkedIn<span className="visually-hidden">, opens in a new tab</span></a></div><EnquiryForm context={context} changeContext={setContext}/></div></section>
    </main>
    <footer className="frame footer"><a className="wordmark" href="#top">Soniaa</a><a className="underlink" href="#top">Back to top</a></footer>
  </>;
}
