import numpy as np
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility
from datasets import load_dataset
from sklearn.manifold import TSNE
import json
from laion_clap import CLAP_Module
import torch
from huggingface_hub import login

# Authenticate and set up parameters
login(token="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")
DIMENSION = 512
MILVUS_HOST = "milvus-standalone"
MILVUS_PORT = "19530"
DATASET = 'DISCOX/vctk_clap'
DATASET_NAME = 'vctk'
LINK_FIELD = 'speaker_id'
NAME_FIELD = 'text'
EMBEDDING_FIELD = 'clap'
MODEL = 'laion_clap/music_speech_audioset_epoch_15_esc_89.98.pt'

# Load the dataset directly into the Dataset object
dataset = load_dataset(DATASET, split='train')

with open('fields.json', 'r') as file:
    dataset_fields_data = json.load(file)

additional_fields = [field['name'] for field in dataset_fields_data['fields']]
essential_fields = [EMBEDDING_FIELD, LINK_FIELD, NAME_FIELD]
fields_to_check = essential_fields + additional_fields
fields_to_check = [EMBEDDING_FIELD, LINK_FIELD, NAME_FIELD]

dataset_fields = [
    FieldSchema(name=field['name'], dtype=DataType[field['dtype']], max_length=field['max_length'])
    for field in dataset_fields_data['fields']
]

# Load the dataset
dataset = load_dataset(DATASET, split='train')

# Define a function to check if a field is non-empty
def is_non_empty(field_value):
    if field_value is None:
        return False
    if isinstance(field_value, (list, str)) and len(field_value) == 0:
        return False
    return True


# Filter the dataset
filtered_dataset = dataset.filter(lambda x: all(is_non_empty(x[field]) for field in fields_to_check))

print("Filtered dataset:", filtered_dataset)
filtered_dataset = dataset.filter(lambda x: x[EMBEDDING_FIELD] is not None and len(x[EMBEDDING_FIELD]) == DIMENSION)

# Define the model
model = CLAP_Module(enable_fusion=False, amodel='HTSAT-base')
model.load_ckpt(MODEL)

# Load class data
with open('classes.json', 'r') as file:
    class_data = json.load(file)
classes = class_data['classes']

# Generate embeddings for each class
def embed(description):
    return model.get_text_embedding([description, ""], use_tensor=True)[0]

class_embeddings = {cls['class']: embed(cls['description']) for cls in classes}

# Define cosine similarity function
def cosine_similarity(embedding1, embedding2):
    return torch.nn.functional.cosine_similarity(embedding1, embedding2, dim=0)

# Apply t-SNE transformation using batch processing
tsne = TSNE(n_components=2, random_state=0)
def apply_tsne(batch):
    embeddings = np.stack(batch[EMBEDDING_FIELD])
    tsne_result = tsne.fit_transform(embeddings)
    return {"x": tsne_result[:, 0], "y": tsne_result[:, 1]}

tsne_dataset = filtered_dataset.map(apply_tsne, batched=True, batch_size=1000)

# Classify embeddings and map results
def classify_class(row):
    tensor_embedding = torch.tensor(row[EMBEDDING_FIELD]) if not isinstance(row[EMBEDDING_FIELD], torch.Tensor) else row[EMBEDDING_FIELD]
    similarities = {cls: cosine_similarity(tensor_embedding, class_emb) for cls, class_emb in class_embeddings.items()}
    predicted_class = max(similarities, key=similarities.get)
    return {"class": predicted_class}

classified_dataset = tsne_dataset.map(classify_class, batched=False)

def finalize_dataset(example, index):
    example['id'] = index  # Add an ID column
    return example

final_dataset = classified_dataset.map(finalize_dataset, with_indices=True, batched=False)

# Save to CSV
csv_file_path = f"data/graph/{DATASET_NAME}_graph.csv"
final_dataset.to_csv(csv_file_path, columns=['id', 'x', 'y', 'class', NAME_FIELD])
print(f"Dataset saved to {csv_file_path}")

# Set up Milvus connection and schema
connections.connect("default", host=MILVUS_HOST, port=MILVUS_PORT, db_name="default")
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=False),
    FieldSchema(name="x", dtype=DataType.FLOAT, max_length=1000),
    FieldSchema(name="y", dtype=DataType.FLOAT, max_length=1000),
    FieldSchema(name="class", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=1000),
    FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=DIMENSION),
] + dataset_fields

if utility.has_collection(DATASET_NAME):
    utility.drop_collection(DATASET_NAME)

schema = CollectionSchema(fields=fields, enable_dynamic_field=True)
collection = Collection(name=DATASET_NAME, schema=schema)
collection.create_index(field_name="embedding", index_params={"metric_type":"COSINE", "index_type":"FLAT"})
collection.load()

# Insert data into Milvus
current_id = 0
additional_field_names = [field['name'] for field in dataset_fields_data['fields']]

def insert_function(batch):
    global current_id
    # Calculate the batch size
    batch_size = len(batch[EMBEDDING_FIELD])
    # Create a range of IDs for this batch
    ids = list(range(current_id, current_id + batch_size))
    # Update the current ID counter
    current_id += batch_size
    embeddings = batch[EMBEDDING_FIELD]
    additional_fields_data = [batch[field_name] for field_name in additional_field_names]
    data = [ids, batch['x'], batch['y'], batch['class'], batch[NAME_FIELD], batch[LINK_FIELD], embeddings] + additional_fields_data
    collection.insert(data)

classified_dataset.map(insert_function, batched=True, batch_size=1000)
collection.flush()
connections.disconnect("default")
