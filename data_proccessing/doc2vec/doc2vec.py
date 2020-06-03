import os
import gensim
import smart_open
import json
# Set file names for train and test data
# test_data_dir = os.path.join(gensim.__path__[0], 'test', 'test_data')
# lee_train_file = os.path.join(test_data_dir, 'lee_background.cor')
# lee_test_file = os.path.join(test_data_dir, 'lee.cor')

lee_train_file = '../../server/doc2vecInputFile.txt'



def read_corpus(fname, tokens_only=False):
    with smart_open.open(fname, encoding="iso-8859-1") as f:
        for i, line in enumerate(f):
            tokens = gensim.utils.simple_preprocess(line)
            if tokens_only:
                yield tokens
            else:
                # For training data, add tags
                yield gensim.models.doc2vec.TaggedDocument(tokens, [i])

train_corpus = list(read_corpus(lee_train_file))
# test_corpus = list(read_corpus(lee_test_file, tokens_only=True))

model = gensim.models.doc2vec.Doc2Vec(vector_size=50, min_count=2, epochs=40)
model.build_vocab(train_corpus)
model.train(train_corpus, total_examples=model.corpus_count, epochs=model.epochs)

with open("docVectors.json", "w") as f:
    json.dump(list(map(lambda taggedDoc: model.infer_vector(taggedDoc.words).tolist(), train_corpus)), f)
# vector = model.infer_vector(['only', 'you', 'can', 'prevent', 'forest', 'fires'])
# vector2 = model.infer_vector(['light', 'pattern', 'lighting', 'design', 'metal', 'ceiling'])



# print(vector)
# print(vector2)

# print(train_corpus[:2])
# print(test_corpus[:2])