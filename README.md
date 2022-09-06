# Google Cloud Trendspotting Solution

This project provides a fully functional trendspotting solution to deploy and use in any Google Cloud environment.

[![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.png)](https://ssh.cloud.google.com/cloudshell/open?cloudshell_git_repo=https://github.com/tyayers/google-cloud-trendspotting&cloudshell_git_branch=main&cloudshell_workspace=.&cloudshell_tutorial=docs/tutorial.md)

Features in this deployment:
* Parse an initial set of terms to monitor trends for (for example herbal remedies, Harry Potter characters, or anything basically under the sun that you want to monitor...).
* Deploy monitoring pipelines to automatically check daily on how the terms are trending, data is aggregated into a BigQuery table.
* Deploy a monitoring dashboard app to view the trend status of the terms, and also display trend data from Google Trends, GDELT, and other sources.


