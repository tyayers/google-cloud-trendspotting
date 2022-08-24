PROJECT=cloud31x
REGION=europe-west1
BUCKET=planttrends-$(echo $RANDOM | md5sum | head -c 5; echo;)

echo Create bucket $BUCKET in region $REGION

gcloud alpha storage buckets create gs://$BUCKET --project=$PROJECT --default-storage-class=STANDARD --location=$REGION --uniform-bucket-level-access
gsutil iam ch allUsers:objectViewer gs://$BUCKET