"""
Microsoft Fabric Demo Web App - Simplified Version
Business Stakeholder Showcase - No pandas dependency
"""

from flask import Flask, render_template, jsonify
from flask_cors import CORS
import requests
import gzip
import json
from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict
import time

app = Flask(__name__)
CORS(app)

class FabricDemo:
    def __init__(self):
        self.events = []
        self.analysis = {}
        
    def fetch_recent_data(self):
        """Fetch recent GitHub data for demo"""
        self.events = []
        
        # Try multiple time ranges for better reliability
        now = datetime.now(timezone.utc)
        
        # Try different hour ranges to find available data
        hour_ranges = [
            (6, 2),   # Go back 6-8 hours (most reliable)
            (4, 2),   # Go back 4-6 hours
            (12, 3),  # Go back 12-15 hours
            (24, 4),  # Go back 24-28 hours (yesterday)
        ]
        
        for start_offset, num_hours in hour_ranges:
            if len(self.events) > 50000:  # Stop if we already have enough data
                break
                
            start_time = now - timedelta(hours=start_offset + num_hours)
            
            for i in range(num_hours):
                hour_time = start_time + timedelta(hours=i)
                url = f"https://data.gharchive.org/{hour_time.strftime('%Y-%m-%d-%H')}.json.gz"
                
                try:
                    print(f"Trying: {url}")
                    response = requests.get(url, timeout=30)
                    response.raise_for_status()
                    
                    decompressed = gzip.decompress(response.content).decode('utf-8')
                    
                    hour_events = []
                    for line in decompressed.strip().split('\n'):
                        if line:
                            try:
                                hour_events.append(json.loads(line))
                            except json.JSONDecodeError:
                                continue
                    
                    self.events.extend(hour_events)
                    print(f"✓ Fetched {len(hour_events):,} events from {url}")
                    time.sleep(0.5)
                    
                except requests.RequestException as e:
                    print(f"✗ Failed: {url} - {e}")
                    continue
                    
        print(f"Total events fetched: {len(self.events):,}")
        return len(self.events) > 0
    
    def analyze_data(self):
        """Analyze fetched data for business insights"""
        if not self.events:
            return None
            
        # Event types
        event_types = Counter(e['type'] for e in self.events)
        
        # Top repositories
        repo_activity = Counter(e['repo']['name'] for e in self.events 
                               if 'repo' in e and 'name' in e['repo'])
        top_repos = repo_activity.most_common(10)
        
        # Developer activity
        actor_activity = Counter(e['actor']['login'] for e in self.events 
                                if 'actor' in e and 'login' in e['actor'])
        top_actors = actor_activity.most_common(10)
        
        # Business metrics
        total_events = len(self.events)
        unique_repos = len(repo_activity)
        unique_developers = len(actor_activity)
        
        # Calculate engagement metrics
        push_events = event_types.get('PushEvent', 0)
        pr_events = event_types.get('PullRequestEvent', 0)
        collaboration_score = (pr_events + push_events) / total_events * 100 if total_events > 0 else 0
        
        # Language detection (simple heuristic from repo names)
        languages = defaultdict(int)
        for event in self.events:
            if 'repo' in event and 'name' in event['repo']:
                repo_name = event['repo']['name'].lower()
                if any(x in repo_name for x in ['python', '.py', '-py-']):
                    languages['Python'] += 1
                elif any(x in repo_name for x in ['javascript', 'js', 'node', 'react', 'vue']):
                    languages['JavaScript'] += 1
                elif any(x in repo_name for x in ['java', '-jvm-']):
                    languages['Java'] += 1
                elif any(x in repo_name for x in ['go', 'golang']):
                    languages['Go'] += 1
                elif any(x in repo_name for x in ['rust', '-rs-']):
                    languages['Rust'] += 1
                else:
                    languages['Other'] += 1
        
        self.analysis = {
            'total_events': total_events,
            'unique_repositories': unique_repos,
            'active_developers': unique_developers,
            'event_types': dict(event_types.most_common(10)),
            'top_repositories': top_repos,
            'top_developers': top_actors,
            'languages': dict(languages),
            'collaboration_score': round(collaboration_score, 1),
            'push_events': push_events,
            'pr_events': pr_events,
            'data_freshness': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
        }
        
        return self.analysis

demo = FabricDemo()

@app.route('/')
def index():
    return render_template('index.html')

def get_demo_data():
    """Return sample demo data when GitHub Archive is unavailable"""
    return {
        'total_events': 146091,
        'unique_repositories': 60579,
        'active_developers': 44489,
        'event_types': {
            'PushEvent': 94078,
            'PullRequestEvent': 15031,
            'CreateEvent': 9625,
            'IssueCommentEvent': 6200,
            'DeleteEvent': 4747,
            'IssuesEvent': 4397,
            'PullRequestReviewCommentEvent': 3372,
            'PullRequestReviewEvent': 3253,
            'WatchEvent': 3080,
            'ReleaseEvent': 1022
        },
        'top_repositories': [
            ['LemonbangoTango/bunnyhookwebsite', 1162],
            ['Flo-App-bxl/TDID-Live', 833],
            ['gabagool222/aster-bot', 525],
            ['DerafshAtur/bot-storage', 347],
            ['escapingwork/teenagerspopulation', 328],
            ['Dodotry/mvideo', 314],
            ['hajinaka44-boop/update', 261],
            ['Expensify/App', 239],
            ['sidarthus89/EVE-Data-Site-Dev', 225],
            ['sidarthus89/EVE-Data-Site', 223]
        ],
        'top_developers': [
            ['github-actions[bot]', 19263],
            ['dependabot[bot]', 6068],
            ['pull[bot]', 2865],
            ['Copilot', 2338],
            ['LemonbangoTango', 1162],
            ['renovate[bot]', 1032],
            ['coderabbitai[bot]', 866],
            ['Flo-App-bxl', 833],
            ['public-glueops-renovatebot[bot]', 647],
            ['scala-steward', 644]
        ],
        'collaboration_score': 74.3,
        'push_events': 94078,
        'pr_events': 15031,
        'languages': {
            'Other': 134432,
            'Go': 7096,
            'JavaScript': 2978,
            'Python': 711,
            'Rust': 452,
            'Java': 421
        },
        'data_freshness': datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    }

@app.route('/fetch-data')
def fetch_data():
    """Fetch fresh data for demo"""
    success = demo.fetch_recent_data()
    if success:
        analysis = demo.analyze_data()
        return jsonify({
            'success': True,
            'message': f'Successfully fetched {len(demo.events):,} events',
            'analysis': analysis
        })
    else:
        # Try fallback demo mode with sample data
        return jsonify({
            'success': True,
            'message': 'Using demo data (GitHub Archive temporarily unavailable)',
            'analysis': get_demo_data()
        })

@app.route('/get-analysis')
def get_analysis():
    """Get current analysis"""
    if demo.analysis:
        return jsonify({
            'success': True,
            'analysis': demo.analysis
        })
    else:
        return jsonify({
            'success': False,
            'message': 'No data available. Please fetch data first.'
        })

@app.route('/fabric-benefits')
def fabric_benefits():
    """Return Fabric value proposition"""
    benefits = {
        'real_time_insights': {
            'title': 'Real-Time Insights',
            'description': 'Process 146K+ events in minutes',
            'value': 'Immediate business intelligence from live data streams'
        },
        'scalable_storage': {
            'title': 'Scalable Storage',
            'description': 'OneLake automatically scales with your data',
            'value': 'No infrastructure management, pay only for what you use'
        },
        'unified_analytics': {
            'title': 'Unified Analytics',
            'description': 'Spark SQL, KQL, and Power BI in one platform',
            'value': 'Single source of truth for all analytics needs with KQL real-time queries'
        },
        'ml_ready': {
            'title': 'ML-Ready Data',
            'description': 'Automated feature engineering pipelines',
            'value': 'Accelerate AI/ML initiatives with clean, structured data'
        }
    }
    return jsonify(benefits)

if __name__ == '__main__':
    print("Starting Microsoft Fabric Demo Web App...")
    print("Open your browser to: http://localhost:5000")
    app.run(debug=True, port=5000)
