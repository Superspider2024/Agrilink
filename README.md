Project Name: AgriLink
Problem:
Smallholder farmers in Kenya and other developing countries face limited access to reliable markets, fair pricing, and affordable transport. Middlemen dominate the agricultural supply chain, often paying farmers low prices and controlling market access. Additionally, farmers lack the logistics capacity to deliver their produce efficiently, and buyers—especially institutional ones—struggle to find verified sources directly from farms.

Solution:
AgriLink is a digital platform that connects smallholder farmers directly to buyers, transport providers, and agricultural services in one centralized, transparent, and user-friendly marketplace. By digitizing the supply chain, AgriLink eliminates unnecessary intermediaries, gives farmers the ability to set their own prices, and allows buyers to access produce directly from the source, with integrated transport options.

How It Works:
Farmers create accounts and list their available produce with quantities, prices, and locations. Buyers (such as supermarkets, exporters, restaurants, or schools) browse listings and place orders. During checkout, buyers choose how they want the produce delivered—either by picking it up themselves, allowing the farmer to deliver, or using the platform's connected network of transporters. Transport costs are calculated and added to the order total automatically if the buyer selects platform delivery.

Messaging features allow farmers and buyers to negotiate or clarify deals. Once an agreement is made, the farmer prepares the produce, and the transport provider is notified if needed.

Key Features:

Separate dashboards for farmers and buyers

Farmer listings with photos, pricing, and stock levels

Buyer order flow with delivery method selection

Transport integration through pre-vetted transporters

Messaging and offer system for negotiation

Order summary and tracking

Role-based authentication for farmers and buyers

Target Users:

Smallholder farmers in rural or peri-urban areas

Institutional and urban buyers seeking fresh produce

Local transporters (boda riders, pickup trucks) seeking delivery gigs

Tech Stack:

Frontend: React.js, Tailwind CSS for styling, React Router for page navigation

Backend: Node.js with Express.js for API logic

Database: MongoDB for storing users, produce, orders, and messages

Authentication: JWT-based login system with role support (farmer or buyer)

Deployment: Vercel or Netlify for frontend, Render or Railway for backend

Optional Future Additions: SMS integration, delivery route optimization, driver mobile app

Goal of the MVP:
Build a working web version of the platform with authentication, a basic produce listing system, buyer ordering flow, messaging, and a simple transport selection step. This MVP will be used to showcase the core value of AgriLink during the hackathon.
