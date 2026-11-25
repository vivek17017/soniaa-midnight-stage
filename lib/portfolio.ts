export const linkedin = "https://www.linkedin.com/in/soniaspecialist/";

export const stories = [
  {
    key: "brand", label: "Brand & messaging", company: "AYU Lifescience", role: "Fractional Marketing Lead",
    summary: "Product communication and website strategy for medical buyers in the UAE.",
    question: "How do you bring one product story across a whole website?",
    detail: "At AYU Lifescience, Soniaa supports product communication and website development. She coordinates the people working on content, interface design, forms, cookies, and CRM tracking so those decisions serve the same audience.",
    action: "Discuss a similar project", intent: "project",
  },
  {
    key: "demand", label: "Demand generation", company: "Lasersec Technologies", role: "Vice President Global Sales Marketing",
    summary: "Leading a team of 20+ marketing professionals in the packaging industry.",
    question: "Who needs to be in the room for demand generation?",
    detail: "Soniaa led a team spanning digital marketing, marketing operations, web, account development, and sales development. Her remit brought these disciplines together around demand generation for the packaging business.",
    action: "Discuss a growth challenge", intent: "project",
  },
  {
    key: "leadership", label: "Team leadership", company: "i-SmokeStack", role: "Chief Marketing Officer",
    summary: "Helping founders and teams turn a shared direction into everyday decisions.",
    question: "How can a team move from a scattered plan to a shared direction?",
    detail: "At i-SmokeStack, Soniaa built frameworks for teams working across marketing and operations. She mentored leaders on setting priorities and carrying decisions through, and helped teams reduce the bottlenecks in their work.",
    action: "Discuss a leadership role", intent: "hiring",
  },
] as const;

export type StoryKey = (typeof stories)[number]["key"];
export type Topic = StoryKey | "direct";
export const topicLabels: Record<Topic, string> = { direct: "General enquiry", brand: "Brand & messaging", demand: "Demand generation", leadership: "Team leadership" };
export const intents = {
  project: "Project or partnership", hiring: "Hiring opportunity", event: "Event invitation", peer: "Professional exchange",
} as const;
export type Intent = keyof typeof intents;

export const experience = [
  ["May 2025 – present", "Chief Marketing & Operations Advisor", "Celestial AI"],
  ["Apr 2025 – present", "Fractional Marketing Lead", "AYU Lifescience"],
  ["Jan 2023 – present", "Chief Marketing & Operations Advisor", "AYU Inc USA"],
  ["Feb 2021 – present", "Vice President Product Marketing", "Lasersec Technologies"],
  ["Apr 2020 – present", "Fractional CMO", "Datt Mediproducts"],
  ["Mar 2020 – present", "Chief Marketing Officer", "i-SmokeStack"],
  ["Oct 2016 – present", "Consulting Specialist", "Sonia Specialist"],
  ["2018 – 2020", "Leader, Digital Marketing · Digital Marketing Director", "RoundGlass"],
  ["2016 – 2018", "Director, Demand Generation & Sales · Vice President Global Sales Marketing", "Lasersec Technologies"],
  ["2013 – 2019", "Founder & CEO · Advisory Board Member", "Brand Tadkaa"],
  ["2013 – 2016", "Digital Consultant", "Sonia Specialist"],
];
export const education = [
  ["2007 – 2008", "Executive MBA, Marketing", "Indian Institute of Management Bangalore"],
  ["2007 – 2009", "PGDBM, Marketing & Sales", "Symbiosis Institute of Management Studies"],
  ["2002 – 2006", "B.E., Electronics & Telecommunication", "Maharshi Dayanand University"],
  ["2001 – 2002", "Non-Medical", "Vidya Mandir School"],
  ["1999 – 2000", "Class X", "Ryan International School"],
];
export const awards = [
  ["May 2018", "Best Leader", "Lasersec Technologies"],
  ["Oct 2017", "Best COSR Expert", "Lasersec Technologies"],
  ["Apr 2016", "Best Sales Performer", "Lasersec Technologies"],
  ["Mar 2015", "Team Spot Light", "Appirio"],
  ["Oct 2014", "Ranked #13 in Top Demand Generation Experts", "Forbes, as listed on LinkedIn"],
  ["Mar 2014", "Outstanding Performer", "ShowMeLeads"],
];
export const credentials = [
  ["Issued Mar 2020", "Fundamentals of Digital Marketing", "Google"],
  ["Oct 2020 – Oct 2021", "Guided Client Onboarding", "HubSpot Academy · expired"],
  ["Mar 2020 – Mar 2021", "2020 HubSpot Champion User · Frictionless Sales · Contextual Marketing · Sales Management", "HubSpot Academy · expired"],
  ["Mar 2020 – Apr 2022", "Growth-Driven Design Agency · Growth-Driven Design", "HubSpot Academy · expired"],
  ["Feb 2020 – Mar 2022", "Sales Enablement", "HubSpot Academy · expired"],
  ["Jan 2020 – Feb 2022", "Inbound Marketing", "HubSpot Academy · expired"],
  ["Jan 2020 – Jan 2022", "Content Marketing", "HubSpot Academy · expired"],
  ["Dec 2019 – Dec 2020", "Marketing Software · Sales Software", "HubSpot Academy · expired"],
  ["Dec 2019 – Jan 2022", "Inbound · Inbound Sales", "HubSpot Academy · expired"],
  ["Nov 2019 – Dec 2021", "Social Media", "HubSpot Academy · expired"],
];
export const services = ["Marketing strategy", "Brand marketing", "Brand consulting", "Content strategy", "Email marketing", "Demand generation", "Leadership development", "Team building", "Training", "Management consulting"];
export const recommendations = [
  {quote:"Sonia is a natural leader who is patient and believes in bringing out the best in her team as well as the teams she supports.", name:"Krittika Sharma", source:"Colleague on a different team · March 2020"},
  {quote:"As a Creative Graphic Designer, I especially appreciated her great attitude and collaborative approach. It was a true team effort.", name:"Deeksha Kharbanda", source:"Direct report · May 2018"},
  {quote:"She is persistent intellectually and always uses that ability to get the right tools in place to make sales and business opportunities bear fruit.", name:"Manish Garg", source:"Direct manager · June 2018"},
];
export const resources = [
  {format:"SlideShare",title:"Free social media management tools",description:"A guide for small businesses, startups, and entrepreneurs.",url:"https://www.slideshare.net/slideshow/free-social-media-management-tools-for-small-business-startups-entrepreneur/78182867",label:"Read the guide",image:"guide"},
  {format:"YouTube",title:"Click to know me",description:"Sonia Specialist’s personal video introduction, 2015 edition.",url:"https://www.youtube.com/watch?v=3CxV1B5H-KI",label:"Watch the film",image:"film"},
];
