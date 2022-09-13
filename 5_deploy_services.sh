cd ./services/data_refresher

PROJECT=$(gcloud config get project)
# Set service name
NAME=trendupdater

# Build and publish image to our cloud registry
gcloud builds submit --tag eu.gcr.io/$PROJECT/$NAME

# Deploy image to Cloud Run and allow unauthenticated traffic to service
gcloud run deploy $NAME --image eu.gcr.io/$PROJECT/$NAME \
  --platform managed --project $PROJECT --region $REGION --no-allow-unauthenticated\
  --memory=256Mi --cpu=1 --service-account "trendservice@$PROJECT.iam.gserviceaccount.com" \
  --timeout 1800s \
  --update-env-vars "BUCKET_NAME=$BUCKET_NAME,TABLE_NAME=$PROJECT.$BUCKET_NAME.news_volume_growth_rates"

export RUN_URL=$(gcloud run services describe $NAME --platform managed --region $REGION --format 'value(status.url)')

cd ../..

cp ./workflows/data-growth-flow.yaml ./workflows/tmp-data-growth-flow.yaml
sed -i "s@CLOUD_RUN_SERVICE_URL@$RUN_URL@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@TOPIC_PLURAL@$TOPIC_PLURAL@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@PROJECT@$PROJECT@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@REGION@$REGION@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@JSON_PATH@gs://$BUCKET_NAME/text_to_bigquery/news_volume_schema_dataflow.json@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@JS_TRANSFORM_PATH@gs://$BUCKET_NAME/text_to_bigquery/news_volume_split.js@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@INPUT_FILE@gs://$BUCKET_NAME/input/news_volume_initial.csv@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@OUTPUT_TABLE@$PROJECT:$BUCKET_NAME.news_volume@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s@TEMP_DIR@gs://$BUCKET_NAME/tmp@" ./workflows/tmp-data-growth-flow.yaml
sed -i "s+SERVICE_EMAIL+trendservice@$PROJECT.iam.gserviceaccount.com+" ./workflows/tmp-data-growth-flow.yaml

gcloud workflows deploy trend_update_flow --location=$REGION --source=workflows/tmp-data-growth-flow.yaml --service-account=trendservice@$PROJECT.iam.gserviceaccount.com

gcloud workflows run trend_update_flow --location=$REGION

gcloud scheduler jobs create http trend_update_job \
--location=$REGION \
--schedule="0 5 * * *" \
--uri="https://workflowexecutions.googleapis.com/v1/projects/$PROJECT/locations/$REGION/workflows/trend_update_flow/executions" \
--time-zone="Europe/Amsterdam" \
--oauth-service-account-email="trendservice@$PROJECT.iam.gserviceaccount.com"