#!/usr/bin/python

import sys, getopt, json
from google.cloud import storage, bigquery
from app import data_initial_load, data_growth, trends_initial_load

def main(argv):
  bucket = ""
  table = ""
  topic_singular = ""
  topic_plural = ""
  command = ""
  
  try:
    opts, args = getopt.getopt(argv,"b:t:s:p:c:",["bucket=", "table=", "topic_singular=", "topic_plural=", "command="])
  except getopt.GetoptError:
    print('command.py -b BUCKET -t TABLE -s TOPIC_SINGULAR -p TOPIC_PLURAL -c INITIAL|INITIAL_TRENDS|UPDATE|GROWTH')
    sys.exit(2)
    
  for opt, arg in opts:
    if opt == '-h':
      print('command.py -b BUCKET -t TABLE -k KEY -c INITIAL|UPDATE|GROWTH')
      sys.exit()
    elif opt in ("-b", "--bucket"):
      bucket = arg
    elif opt in ("-t", "--table"):
      table = arg
    elif opt in ("-s", "--topic_singular"):
      topic_singular = arg
    elif opt in ("-p", "--topic_plural"):
      topic_plural = arg      
    elif opt in ("-c", "--command"):
      command = arg.upper()
      
  print('Bucket is ', bucket)
  print('Table is ', table)
  print('Topic singular is ', topic_singular)
  print('Topic plural is ', topic_plural)  
  print('Command is ', command)
  
  storage_client = storage.Client()
  bucket = storage_client.bucket(bucket)
  
  if command == "INITIAL":
    data_loader = data_initial_load()
    result = data_loader.load(bucket, topic_singular, topic_plural)
    
    #print(json.dumps(result))
    f = open("news_volume_initial.csv", "w")
    f.write(result)
    f.close()
    
  elif command == "GROWTH":
    growth_loader = data_growth()
    result = growth_loader.load(bucket, table)

    f = open("growth_rates.json", "w")
    f.write(json.dumps(result))
    f.close()

  elif command == "INITIAL_TRENDS":
    data_loader = trends_initial_load()
    
    result = data_loader.load(bucket, topic_singular, topic_plural)
    
    #print(json.dumps(result))
    f = open("trend_scores_initial.csv", "w")
    f.write(result)
    f.close()

if __name__ == "__main__":
   main(sys.argv[1:])
