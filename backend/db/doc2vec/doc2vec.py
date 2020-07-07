import os
import json

from gensim.models.doc2vec import TaggedDocument, Doc2Vec
from gensim.utils import simple_preprocess
from gensim.test.utils import get_tmpfile

DOCS_TOKENS_FILE = 'doc-tokens.txt'


def read_corpus(filename):
    with open(filename) as f:
        return [TaggedDocument(simple_preprocess(line), [i])
                for i, line in enumerate(f)]


def train(tagged_docs):
    model = Doc2Vec(vector_size=300, min_count=1, epochs=200,
                    window=30, workers=8, dm=0, dbow_words=1)
    model.build_vocab(tagged_docs)
    model.train(tagged_docs, total_examples=model.corpus_count,
                epochs=model.epochs)
    return model


def write_doc_vectors(model, output_filename):
    with open(output_filename, "w") as f:
        json.dump([list(num.item() for num in model.docvecs[i])
                   for i in range(len(model.docvecs))], f)


if __name__ == "__main__":
    if os.path.exists("model"):
        model = Doc2Vec.load("model")
    else:
        tagged_docs = read_corpus(DOCS_TOKENS_FILE)
        model = train(tagged_docs)
    model.delete_temporary_training_data(
        keep_doctags_vectors=True, keep_inference=True
    )
    model.save("model")
    write_doc_vectors(model, "doc-vectors.json")
