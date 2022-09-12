cd ./clients/trends-dashboard

echo "Replace variables in the client code..."
sed -i "/VITE_TOPIC_SINGULAR=/c\VITE_TOPIC_SINGULAR=$TOPIC_SINGULAR" .env
sed -i "/VITE_TOPIC_PLURAL=/c\VITE_TOPIC_PLURAL=$TOPIC_PLURAL" .env
sed -i "/VITE_DATA_ROOT_URL=/c\VITE_DATA_ROOT_URL=https://storage.googleapis.com/$BUCKET_NAME/output/" .env

echo "Building client..."
npm run build

echo "Now we're going to login to Firebase, please follow the instructions to login..."
firebase login --no-localhost

echo "Now deploying client to firebase..."
firebase projects:addfirebase $PROJECT

#firebase init hosting
FIREBASE_NAME=${BUCKET_NAME//_/-}
echo "Firebase name set to $FIREBASE_NAME"
python3 set_firebase_config.py -p $PROJECT
python3 set_firebase_config.py -t $FIREBASE_NAME
firebase use $PROJECT

firebase hosting:sites:create $FIREBASE_NAME
firebase target:apply hosting $FIREBASE_NAME $FIREBASE_NAME

firebase deploy --only hosting:$FIREBASE_NAME

