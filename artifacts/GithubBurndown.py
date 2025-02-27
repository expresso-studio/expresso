import requests
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import os

def create_burndown_chart(owner, repo, token, sprint_days=14):
    """Create and save a burndown chart with date information"""
    # Get current date and time for filename and title
    current_date = datetime.now()
    date_str = current_date.strftime('%Y-%m-%d_%H-%M-%S')
    formatted_date = current_date.strftime('%Y-%m-%d %H:%M:%S')
    
    # Create filename with date
    filename = f'burndown_chart_{owner}_{repo}_{date_str}.png'
    
    # Fetch and process issues...
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    url = f'https://api.github.com/repos/{owner}/{repo}/issues?state=all&per_page=100'
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    issues = response.json()
    
    # Calculate burndown data
    total_points = len(issues)
    ideal_daily_decrease = total_points / sprint_days
    ideal_burndown = [total_points - (ideal_daily_decrease * i) for i in range(sprint_days + 1)]
    
    start_date = current_date - timedelta(days=sprint_days)
    actual_burndown = []
    dates = []
    
    for day in range(sprint_days + 1):
        current_day = start_date + timedelta(days=day)
        dates.append(current_day.strftime('%Y-%m-%d'))
        
        remaining = total_points
        for issue in issues:
            if issue.get('closed_at'):
                closed_date = datetime.strptime(issue['closed_at'], '%Y-%m-%dT%H:%M:%SZ')
                if closed_date <= current_day:
                    remaining -= 1
        
        actual_burndown.append(remaining)
    
    # Create the chart
    plt.figure(figsize=(12, 8))
    plt.plot(range(sprint_days + 1), ideal_burndown, 'b--', label='Ideal Burndown', linewidth=2)
    plt.plot(range(sprint_days + 1), actual_burndown, 'g-', label='Actual Burndown', linewidth=2)
    
    # Add title with repository info and creation date
    plt.title(f'Burndown Chart - {owner}/{repo}\nCreated: {formatted_date}', pad=20, size=14)
    plt.xlabel('Sprint Days')
    plt.ylabel('Remaining Work')
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend()
    
    # Add data points
    plt.plot(range(sprint_days + 1), actual_burndown, 'go')
    plt.plot(range(sprint_days + 1), ideal_burndown, 'bo')
    
    # Rotate x-axis labels
    plt.xticks(range(sprint_days + 1), dates, rotation=45)
    
    # Add grid
    plt.grid(True, linestyle='--', alpha=0.3)
    
    # Adjust layout
    plt.tight_layout()
    
    # Save the chart
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(current_dir, filename)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"Burndown chart saved as '{filename}'")
    return filename

if __name__ == "__main__":
    OWNER = "expresso-studio"
    REPO = "expresso"
    TOKEN = "f565577393792cba61dfc9dd3e18e2b44b56e968"
    
    try:
        generated_file = create_burndown_chart(OWNER, REPO, TOKEN)
        print(f"Generated burndown chart: {generated_file}")
    except Exception as e:
        print(f"Error: {e}")