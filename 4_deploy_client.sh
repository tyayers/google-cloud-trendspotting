cd ./clients/trends-dashboard

npm run build

echo "Now we're going to login to Firebase, please follow the instructions to login..."
firebase login --no-localhost
firebase projects:addfirebase $PROJECT

#firebase init hosting
python3 set_firebase_config.py -p $PROJECT
python3 set_firebase_config.py -p $BUCKET_NAME
firebase use $PROJECT

firebase hosting:sites:create $BUCKET_NAME
firebase target:apply hosting $BUCKET_NAME $BUCKET_NAME

firebase deploy --only hosting:$BUCKET_NAME
