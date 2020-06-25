import os
from gensim.models.doc2vec import TaggedDocument, Doc2Vec
from gensim.utils import simple_preprocess
import json

DOCS_TOKENS_FILE = 'doc-tokens.txt'


def read_corpus(filename):
    with open(filename) as f:
        return [TaggedDocument(simple_preprocess(line), [i])
                for i, line in enumerate(f)]


def train(tagged_docs):
    model = Doc2Vec(vector_size=300, min_count=1, epochs=200, window = 30, workers=8, dm=0, dbow_words=1)
    model.build_vocab(tagged_docs)
    model.train(tagged_docs, total_examples=model.corpus_count,
                epochs=model.epochs)
    return model


def write_doc_vectors(model, output_filename):
    with open("doc-vectors.json", "w") as f:
        json.dump([list(num.item() for num in model.docvecs[i])
                   for i in range(len(model.docvecs))], f)


if __name__ == "__main__":
    tagged_docs = read_corpus(DOCS_TOKENS_FILE)
    model = train(tagged_docs)
    write_doc_vectors(model, "doc-vectors.json")
