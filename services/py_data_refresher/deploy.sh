# Call like this ./deploy.sh $PROJECT

# Set service name
NAME=gdeltservice

# Build and publish image to our cloud registry
gcloud builds submit --tag eu.gcr.io/$1/$NAME

# Deploy image to Cloud Run and allow unauthenticated traffic to service
gcloud run deploy $NAME --image eu.gcr.io/$1/$NAME \
  --platform managed --project $1 --region europe-west1 \
  --memory=128Mi --cpu=1 \
  --allow-unauthenticated