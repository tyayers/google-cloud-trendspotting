cd ./clients/trends-dashboard

echo "Replace variables in the client code..."
sed -i "/VITE_TOPIC_SINGULAR=/c\VITE_TOPIC_SINGULAR=$TOPIC_SINGULAR" .env
sed -i "/VITE_TOPIC_PLURAL=/c\VITE_TOPIC_PLURAL=$TOPIC_PLURAL" .env
sed -i "/VITE_ENTITIES_URL=/c\VITE_ENTITIES_URL=https://storage.googleapis.com/$BUCKET_NAME/output/topic_entities.json" .env

echo "Building client..."
npm run build

echo "Now we're going to login to Firebase, please follow the instructions to login..."
firebase login --no-localhost

echo "Now deploying client to firebase..."
firebase projects:addfirebase $PROJECT

#firebase init hosting
python3 set_firebase_config.py -p $PROJECT
python3 set_firebase_config.py -t $BUCKET_NAME
firebase use $PROJECT

firebase hosting:sites:create $BUCKET_NAME
firebase target:apply hosting $BUCKET_NAME $BUCKET_NAME

firebase deploy --only hosting:$BUCKET_NAME

