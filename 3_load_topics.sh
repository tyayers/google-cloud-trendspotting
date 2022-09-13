cd ./services/wikipedia_scraper

echo "Installing dependencies..."
pip3 install -r requirements.txt

python3 command.py -u $TOPIC_SCRAPE_URL -f true -t $TOPIC_PLURAL

echo "Now uploading topics to our storage gucket $BUCKET_NAME..."
gcloud alpha storage cp topic_entities.json gs://$BUCKET_NAME/output/topic_entities.json

cd ../..

echo "Now copying dataflow templates to our storage bucket $BUCKET_NAME..."
gcloud alpha storage cp ./data/news_volume_schema.json gs://$BUCKET_NAME/text_to_bigquery/news_volume_schema.json
gcloud alpha storage cp ./data/news_volume_schema_dataflow.json gs://$BUCKET_NAME/text_to_bigquery/news_volume_schema_dataflow.json
gcloud alpha storage cp ./data/news_volume_split.js gs://$BUCKET_NAME/text_to_bigquery/news_volume_split.js

echo "Now loading initial data and calculating yesterday's growth.."
cd ./services/data_refresher
pip3 install -r requirements.txt

python3 command.py -c INITIAL -b $BUCKET_NAME -k $TOPIC_PLURAL

gcloud dataflow jobs run data_initial_load \
    --gcs-location gs://dataflow-templates/latest/GCS_Text_to_BigQuery \
    --region $REGION \
    --service-account-email trendservice@$PROJECT.iam.gserviceaccount.com \
    --parameters \
javascriptTextTransformFunctionName=transform,\
JSONPath=gs://$BUCKET_NAME/text_to_bigquery/news_volume_schema_dataflow.json,\
javascriptTextTransformGcsPath=gs://$BUCKET_NAME/text_to_bigquery/news_volume_split.js,\
inputFilePattern=gs://$BUCKET_NAME/input/news_volume_initial.csv,\
outputTable=$PROJECT:$BUCKET_NAME.news_volume,\
bigQueryLoadingTemporaryDirectory=gs://$BUCKET_NAME/tmp

python3 command.py -c GROWTH -t "$PROJECT.$BUCKET_NAME.news_volume_growth_rates" -b $BUCKET_NAME

cd ../..
