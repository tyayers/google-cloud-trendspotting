echo "First let's enable all APIs needed for this solution."
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com

echo "Now let's create a service account to access the resources with"
gcloud iam service-accounts create trendservice \
    --description="Service account to manage trend resources" \
    --display-name="TrendService"

echo "Now let's give the account the right role access to the project $PROJECT"
gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:trendservice@$PROJECT.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

echo "Creating storage bucket..."
gcloud alpha storage buckets create gs://$BUCKET_NAME

echo "Now setting the visability to public..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
gsutil cors set ./data/cors_config.json gs://$BUCKET_NAME
