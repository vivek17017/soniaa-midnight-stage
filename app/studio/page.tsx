
import type {Metadata} from "next";
import {getChatGPTUser,chatGPTSignInPath} from "@/app/chatgpt-auth";
import {isOwner} from "@/lib/server-data";
import Report from "./report";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Private report | Soniaa",robots:{index:false,follow:false}};
export default async function Studio() {
  const user=await getChatGPTUser();
  return <main className="frame studio"><a href="/" className="underlink">Return to the portfolio</a><h1>Private <em>studio.</em></h1>
    {isOwner(user)?<Report localPreview={process.env.LOCAL_PORTFOLIO_PREVIEW === "1"}/>:<><p>This inbox and engagement report are available to the designated owner.</p>{!user&&<a className="button secondary" target="_top" href={chatGPTSignInPath("/studio")}>Sign in to open the report</a>}</>}
  </main>;
}
