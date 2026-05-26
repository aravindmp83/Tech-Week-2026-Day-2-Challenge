import csv
import json
import os

def csv_to_json(csv_path, json_path):
    print(f"Reading {csv_path}...")
    with open(csv_path, encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
        # Convert numeric and boolean fields dynamically
        for r in rows:
            for k, v in r.items():
                if v == '':
                    r[k] = None
                else:
                    # Clean up spaces
                    val = v.strip()
                    try:
                        if '.' in val:
                            r[k] = float(val)
                        else:
                            r[k] = int(val)
                    except ValueError:
                        if val.upper() == 'TRUE':
                            r[k] = True
                        elif val.upper() == 'FALSE':
                            r[k] = False
                        else:
                            r[k] = val
                        
    # Ensure parent directory exists
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(rows, f, indent=2)
    print(f"Successfully converted and saved {len(rows)} records to {json_path}")

# Create directories and convert files
try:
    csv_to_json('monthly_activity.csv', 'app/data/monthly_activity.json')
    csv_to_json('yearly_operations.csv', 'app/data/yearly_operations.json')
    print("ALL CONVERSIONS COMPLETE!")
except Exception as e:
    print(f"Error occurred during CSV parsing: {str(e)}")
