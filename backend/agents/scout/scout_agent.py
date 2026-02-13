
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
from googlesearch import search

class CfpScoutAgent:
    def __init__(self, topic_keywords: List[str]):
        self.topics = [t.lower() for t in topic_keywords]

    def scan_opportunities(self) -> List[Dict]:
        """
        Refactored: Uses Google Search to find relevant CFPs across multiple platforms.
        """
        results = []
        print(f"🕵️ Scout Agent activated. Searching for topics: {self.topics}")

        # Construct a search query (Google Specific)
        # "Call for Papers" site:papercall.io OR site:sessionize.com "AI" "FinOps"
        query_topics = " ".join([f'"{t}"' for t in self.topics])
        query = f'"Call for Papers" (site:papercall.io OR site:sessionize.com OR site:cfp.io) {query_topics}'
        
        print(f"   -> Querying Google: '{query}'")
        
        try:
            # search() returns generator, convert to list with limit
            # advanced=True gets title/description
            search_results = search(query, num_results=10, advanced=True)
            
            count = 0
            for res in search_results:
                count += 1
                match_score = 0.6 # Base score for Google result
                
                # Check snippet for keywords
                for keyword in self.topics:
                    if keyword in res.title.lower() or keyword in res.description.lower():
                        match_score += 0.1
                
                results.append({
                    "name": res.title,
                    "location": "See Link",
                    "link": res.url,
                    "match_score": min(match_score, 0.99),
                    "source": "Google",
                    "snippet": res.description[:100] + "..."
                })
            
            print(f"   -> Found {count} potential matches.")

        except Exception as e:
            print(f"   ! Error searching Google: {e}")
            
        # Add mock if search fails (e.g. rate limits 429)
        if not results:
             print("   ! No search results found (likely 429 Rate Limit). Showing MOCK data.")
             results.extend([
                { "name": "AI Engineer World's Fair 2026 (MOCK)", "match_score": 0.95, "link": "https://mocklink.com" },
                { "name": "PyData Global 2026 (MOCK)", "match_score": 0.88, "link": "https://mocklink.com" }
            ])

        return results

if __name__ == "__main__":
    # Test Run
    agent = CfpScoutAgent(topic_keywords=["python", "ai", "data", "cloud"])
    opportunities = agent.scan_opportunities()
    
    print(f"\n✅ Found {len(opportunities)} Opportunities:")
    for opp in opportunities:
        print(f" - {opp['name']}")
        print(f"   Match: {int(opp.get('match_score', 0)*100)}% | Loc: {opp.get('location')}")
        print(f"   Link: {opp.get('link', 'N/A')}")
        print("   ---")
