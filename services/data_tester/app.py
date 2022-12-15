import os
import web
import requests
import json
import time
import csv
from datetime import datetime, timedelta
from google.cloud import storage, bigquery
from pytrends.request import TrendReq

def main():
    f = open('terms.json')
    terms = json.load(f)
    f.close()

    term_list = get_terms(terms)
    result = get_trends_latest(term_list, terms["geos"], "")
    # with open('trend_scores_initial.csv', 'w', encoding='UTF8', newline='') as f:
    #     writer = csv.writer(f)

    #     # write the header
    #     writer.writerow(header)

    #     # write multiple rows
    #     writer.writerows(data)

    with open("trend_scores_latest.csv", "w") as outfile:
        outfile.write(result)

def get_terms(data):

    result = []
    for term in data["terms"]:
        name = term["Name"]
        name = name.replace("-", " ")
        name_pieces = name.split(" ")
        name = ""
        for name_piece in name_pieces:
            if len(name_piece) > 2:
              name = name + " " + name_piece.replace(",", "")
            
        # name = name.replace(", ", " ").replace(" or ", "").replace(" in 
        result.append(name)

    print(result)

    return result

def get_news_volume(terms, topic_singular):
    result = ""
    for term in terms:
        query = ""
        queryWords = term.split(" ")
        for word in queryWords:
            tempWord = word.lower().replace(",", "").replace(".", "").replace(
                " or ", "").replace(" and ", "").replace("-", " ").replace("(", "").replace(")", "").replace("aka", "")

            if len(tempWord) > 2:
                tempWord = tempWord.replace(" ", "%20")
                if (query == ""):
                    query = tempWord
                else:
                    query = query + "%20" + tempWord

        print('Searching GDELT for ', query)

        url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + \
            query + \
            '%20' + topic_singular + '&mode=timelinevolraw&format=json'
        vol = requests.get(url)

        volData = vol.json()
        if "timeline" in volData:
        
            print('Found ', len(volData["timeline"][0]["data"]), ' records')
            for day in volData["timeline"][0]["data"]:
                if result != "":
                    result = result + "\n"

                result = result + term.replace(",", "") + "," + day["date"] + "," + \
                    str(day["value"]) + "," + str(day["norm"])

        time.sleep(.3)

    return result

def get_news_volume_latest(terms, topic_singular):
    result = ""
    yesterday_string = datetime.strftime(
        datetime.now() - timedelta(1), '%Y%m%d') + "T000000Z"
    for term in terms:
        query = ""
        queryWords = term.split(" ")
        for word in queryWords:
            tempWord = word.lower().replace(",", "").replace(".", "").replace(
                " or ", "").replace(" and ", "").replace("-", " ").replace("(", "").replace(")", "").replace("aka", "")

            if len(tempWord) > 2:
                tempWord = tempWord.replace(" ", "%20")
                
                if (query == ""):
                    query = tempWord
                else:
                    query = query + "%20" + tempWord

        url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + \
            query + \
            '%20' + topic_singular + '&mode=timelinevolraw&format=json&TIMESPAN=1w'
        vol = requests.get(url)

        volData = vol.json()
        if "timeline" in volData and len(volData["timeline"]) > 0:
            for day in volData["timeline"][0]["data"]:

                # Only get yesterday's value...
                if str(day["date"]) == yesterday_string:
                    if result != "":
                        result = result + "\n"

                    result = result + term.replace(",", "") + "," + day["date"] + "," + \
                        str(day["value"]) + "," + str(day["norm"])

        time.sleep(.2)

    return result

def get_trends_initial(terms, geos, topic_singular):
    result = ""
    pytrends = TrendReq(hl='en-US', tz=60, retries=8, timeout=(10,25), backoff_factor=0.8)

    for term in terms:
        kw_list = [term + " " + topic_singular]

        for geo in geos:
            new_geo = ""
            if geo != "WORLD":
                new_geo = geo

            pytrends.build_payload(kw_list, cat=0, timeframe='today 5-y', geo=new_geo, gprop='')
            df = pytrends.interest_over_time()

            for row in df.itertuples():
                if result != "":
                    result = result + "\n"

                new_line = geo + "," + term.replace(",", "") + "," + str(row.Index.date()) + "," + str(row[1])
                result = result + new_line
                print(new_line)

    return result

def get_trends_latest(terms, geos, topic_singular):
    result = ""
    pytrends = TrendReq(hl='en-US', tz=60, retries=8, timeout=(10,25), backoff_factor=0.8)

    for term in terms:
        kw_list = [term + " " + topic_singular]

        for geo in geos:
            new_geo = ""
            if geo != "WORLD":
                new_geo = geo

            pytrends.build_payload(kw_list, cat=0, timeframe='today 1-m', geo=new_geo, gprop='')
            df = pytrends.interest_over_time()

            for row in df.itertuples():
                if result != "":
                    result = result + "\n"

                new_line = geo + "," + term.replace(",", "") + "," + str(row.Index.date()) + "," + str(row[1])
                result = result + new_line
                print(new_line)

    return result

if __name__ == "__main__":
    main()