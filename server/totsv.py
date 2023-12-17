import pandas as pd
import json

# Read the JSON file
with open('graph_data.json', 'r') as infile:
    graph_data = json.load(infile)

# Convert the 'nodes' list to a pandas DataFrame
df_nodes = pd.DataFrame(graph_data['nodes'])

# Export to a TSV file
df_nodes.to_csv('graph_data.tsv', sep='\t', index=False)
