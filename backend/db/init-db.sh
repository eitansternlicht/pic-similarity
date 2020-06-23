#!/bin/bash

curl -XDELETE "http://localhost:9200/labels"
curl -XPUT "http://localhost:9200/labels"
curl -XPUT "http://localhost:9200/labels/_settings" -H 'Content-Type: application/json' -d'{  "mapping" : {    "total_fields" : {      "limit" : "100000"    }  },  "index": {    "blocks": {      "read_only_allow_delete": "false"    }  }}'
curl -XPUT "http://localhost:9200/labels/_mapping" -H 'Content-Type: application/json' -d'{  "properties": {        "image_path" : {          "type" : "keyword"        },        "labelAnnotations" : {          "properties" : {            "description" : {              "type" : "text"            },            "mid" : {              "type" : "text"            },            "score" : {              "type" : "float"            },            "topicality" : {              "type" : "float"            }          }        },        "tfIdf_vector" : {          "type": "sparse_vector"        },        "doc2vec_vector" : {          "type": "dense_vector",          "dims": 50        }  }}'
curl -XPUT -H "Content-Type: application/json" http://localhost:9200/_cluster/settings -d '{ "transient": { "cluster.routing.allocation.disk.threshold_enabled": false } }'
curl -XPUT -H "Content-Type: application/json" http://localhost:9200/_all/_settings -d '{"index.blocks.read_only_allow_delete": null}'

./node_modules/elasticdump/bin/elasticdump --input=./db/docs.esdata --output=http://localhost:9200/labels --type=data