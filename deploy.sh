cd ./clients/plants-web-dash
./deploy.sh

cd ../..

git stage .
git commit -m "$1"
git push origin main