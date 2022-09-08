#!/usr/bin/python

import sys, getopt, json
from app import wikipedia_scraper

def main(argv):
  flatten = False
  url = ""
  topic = ""
  
  try:
    opts, args = getopt.getopt(argv,"u:f:t:",["url=", "flatten=", "topic="])
  except getopt.GetoptError:
    print('command.py -u URL -f true|false -t TOPIC')
    sys.exit(2)
    
  for opt, arg in opts:
    if opt == '-h':
      print('command.py -u URL -f true|false -t TOPIC')
      sys.exit()
    elif opt in ("-u", "--url"):
      url = arg
    elif opt in ("-f", "--flatten"):
      flatten = arg
    elif opt in ("-t", "--topic"):
      topic = arg
      
  print('URL is ', url)
  print('flatten is ', flatten)
  print('topic is ', topic)
  
  scraper = wikipedia_scraper()
  result = scraper.getData(url, topic, flatten)
  
  #print(json.dumps(result))
  f = open("topic_entities.json", "w")
  f.write(json.dumps(result, sort_keys=True, indent=2))
  f.close()

if __name__ == "__main__":
   main(sys.argv[1:])
