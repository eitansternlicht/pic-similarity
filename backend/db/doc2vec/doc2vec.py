import os
import json
from json import JSONEncoder
import numpy
from http.server import HTTPServer, BaseHTTPRequestHandler
from io import BytesIO
from gensim.models.doc2vec import TaggedDocument, Doc2Vec
from gensim.utils import simple_preprocess
from gensim.test.utils import get_tmpfile
import time


DOCS_TOKENS_FILE = 'doc-tokens.txt'
model = None


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


class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        start = time.time()
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        labelAnnotations = json.loads(body)
        print(labelAnnotations)
        vec = model.infer_vector(labelAnnotations)
        self.send_response(200)
        self.end_headers()
        response = BytesIO()
        response.write(str.encode(json.dumps(vec, cls=NumpyArrayEncoder)))
        end = time.time()
        print("query time: {}".format(end - start))
        self.wfile.write(response.getvalue())


if __name__ == "__main__":
    model = Doc2Vec.load("model")
    # tagged_docs = read_corpus(DOCS_TOKENS_FILE)
    # model = train(tagged_docs)
    # model.delete_temporary_training_data(
    #     keep_doctags_vectors=True, keep_inference=True
    # )
    # model.save("model")
    # write_doc_vectors(model, "doc-vectors.json")

    httpd = HTTPServer(('localhost', 8000), SimpleHTTPRequestHandler)
    print('started web server')
    httpd.serve_forever()
