echo "First let's enable all APIs needed for this solution."
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable dataflow.googleapis.com
gcloud services enable compute.googleapis.com
gcloud services enable orgpolicy.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable workflows.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudscheduler.googleapis.com

echo "Setting organizational policy configuration..."
PROJECT_NUMBER=$(gcloud projects list --filter="$(gcloud config get-value project)" --format="value(PROJECT_NUMBER)")

sed -i "s@{PROJECTNUMBER}@$PROJECT_NUMBER@" policies/requireOsLogin.yaml
sed -i "s@{PROJECTNUMBER}@$PROJECT_NUMBER@" policies/allowedPolicyMemberDomains.yaml
sed -i "s@{PROJECTNUMBER}@$PROJECT_NUMBER@" policies/requireShieldedVm.yaml
sed -i "s@{PROJECTNUMBER}@$PROJECT_NUMBER@" policies/vmExternalIpAccess.yaml

gcloud org-policies set-policy ./policies/requireOsLogin.yaml --project=$PROJECT --quiet
gcloud org-policies set-policy ./policies/allowedPolicyMemberDomains.yaml --project=$PROJECT --quiet
gcloud org-policies set-policy ./policies/requireShieldedVm.yaml --project=$PROJECT --quiet
gcloud org-policies set-policy ./policies/vmExternalIpAccess.yaml --project=$PROJECT --quiet

echo "Create network, if it doesn't exist..."
gcloud compute networks create default

echo "Now let's create a service account to access the resources with"
gcloud iam service-accounts create trendservice \
    --description="Service account to manage trend resources" \
    --display-name="TrendService"

echo "Now let's give the account the right role access to the project $PROJECT"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/dataflow.admin"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/dataflow.worker"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/bigquery.jobUser"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/run.invoker"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/workflows.invoker"

# gcloud iam service-accounts add-iam-policy-binding trendservice@$PROJECT.iam.gserviceaccount.com --member user:$USER --role roles/iam.serviceAccountUser

echo "Creating storage bucket..."
gcloud alpha storage buckets create gs://$BUCKET_NAME --location $LOCATION

echo "Now setting the visability to public..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
gsutil cors set ./data/cors_config.json gs://$BUCKET_NAME

echo "Now creating BigQuery dataset..."
bq --location=$LOCATION mk --description "Trend tracking dataset for $TOPIC_SINGULAR data." $BUCKET_NAME

echo "Creating BigQuery news table..."
bq mk --table --description "Table to store $TOPIC_SINGULAR news volume data." $BUCKET_NAME.news_volume ./data/news_volume_schema.json

echo "Creating BigQuery score table..."
bq mk --table --description "Table to store $TOPIC_SINGULAR trends score data." $BUCKET_NAME.trend_scores ./data/trend_scores_schema.json

echo "Creating BigQuery view for news volume change..."
bq mk \
--use_legacy_sql=false \
--description "View to see latest $TOPIC_SINGULAR growth rates data." \
--view \
"SELECT name, date, news_volume, previous_news_volume, ROUND((((news_volume + 1) - (previous_news_volume + 1)) / (previous_news_volume + 1)) * 100, 0) AS growth_rate, news_norm FROM 
  (SELECT *, LAG(news_volume) OVER (PARTITION by name ORDER BY date ASC) AS previous_news_volume FROM \`$PROJECT.$BUCKET_NAME.news_volume\` WHERE date = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) OR date = DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)) 
WHERE date = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)" \
$BUCKET_NAME.news_volume_growth_rates

echo "Creating BigQuery view for trends score change..."
bq mk \
--use_legacy_sql=false \
--description "View to see latest $TOPIC_SINGULAR trend score growth rates data." \
--view \
"SELECT
  name,
  date,
  score,
  ROUND(score - previous_score, 0) AS growth_rate
FROM (
  SELECT
    *,
    LAG(score) OVER (PARTITION BY name ORDER BY date ASC) AS previous_score
  FROM
    \`$PROJECT.$BUCKET_NAME.trend_scores\`) ORDER BY name, date ASC" \
$BUCKET_NAME.trend_scores_growth_rates

echo "Creating BigQuery view for growth overview..."
bq mk \
--use_legacy_sql=false \
--description "View to see latest $TOPIC_SINGULAR trend score growth rates data." \
--view \
"SELECT
  trends.name, trends.date, trends.score, trends.growth_rate AS trends_growth, news.growth_rate AS news_growth, ((trends.growth_rate + news.growth_rate) / 2) AS agg_growth
FROM 
  \`$PROJECT.$BUCKET_NAME.trend_scores_growth_rates\` AS trends
JOIN 
  \`$PROJECT.$BUCKET_NAME.news_volume_growth_rates\` AS news
ON
  trends.name = news.name
WHERE trends.date = (
  SELECT date FROM \`$PROJECT.$BUCKET_NAME.trend_scores_growth_rates\` ORDER BY date DESC LIMIT 1
)
ORDER BY agg_growth DESC" \
$BUCKET_NAME.growth_overview