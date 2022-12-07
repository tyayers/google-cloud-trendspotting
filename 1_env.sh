#!/bin/bash

# Copyright 2022 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

export PROJECT="cloud32x" # The name of the GCP project
export NETWORK="default" # The network to use (will be created if it doesn't exist)
export LOCATION="EU" # The geographic location to use for geo-oriented resources
export REGION="europe-west1" # The region to use for any regional resources
export USER=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")

# Uncomment one of these blocks, or add your own

# TOPIC OPTION 1 - Sandwiches scraped from Wikipedia
# export TOPIC_PLURAL="sandwiches"
# export TOPIC_SINGULAR="sandwich"
# export TOPIC_SCRAPE_URL="https://en.wikipedia.org/wiki/List_of_sandwiches"

# TOPIC OPTION 2 - Herbal plant remedies scraped from Wikipedia
export TOPIC_PLURAL="flu"
export TOPIC_SINGULAR="flu"
export TOPIC_SCRAPE_URL="https://en.wikipedia.org/wiki/List_of_plants_used_in_herbalism"

BUCKET_NAME="${TOPIC_SINGULAR}_trends_t$(tr -dc A-Za-z0-9 </dev/urandom | head -c 8 ; echo '')"
export BUCKET_NAME=$(echo "$BUCKET_NAME" | tr '[:upper:]' '[:lower:]')

