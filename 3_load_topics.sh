cd ./services/py_wikipedia_scraper

echo "Installing dependencies..."
pip3 install -r requirements.txt

python3 command.py -u $TOPIC_SCRAPE_URL -f true -t $TOPIC_PLURAL

echo "Now uploading topics to Google Cloud Storage..."
gcloud alpha storage cp topic_entities.json gs://$BUCKET_NAME/output/topic_entities.json

cd ../..
