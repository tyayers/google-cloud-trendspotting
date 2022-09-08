import web
import requests
import json
from bs4 import BeautifulSoup

urls = (
    '/tables(.*)', 'wikipedia_scraper'
)
app = web.application(urls, globals())


class wikipedia_scraper:
    def GET(self, site):
        site = web.input().site
        flatten = False
        topic = ""
        
        if not site:
            site = 'https://en.wikipedia.org/wiki/Web_scraping'

        if "flatten" in web.input() and web.input().flatten == "true":
            flatten = True
            
        if "topic" in web.input():
            topic = web.input().topic
        
        result = self.getData(site, topic, flatten)

        web.header('Access-Control-Allow-Origin', '*')
        web.header('Content-Type', 'application/json')
        return json.dumps(result)

    def getData(self, site, topic, flatten):
        response = requests.get(
            url=site,
        )

        soup = BeautifulSoup(response.content, 'html.parser')
        tables = soup.find_all("table", {"class": "wikitable sortable"})

        result = []
        for table in tables:
            table_result = []
            columns = []
            for header in table.find_all("th"):
                columns.append(header.string.replace("\n", ""))

            for row in table.find("tbody").find_all("tr"):
                cells = row.find_all("td")
                row_value = {}
                for index, value in enumerate(cells):

                    new_value = value.text.replace("\n", "")
                    bracketIndex = new_value.find('[')
                    if bracketIndex != -1:
                        new_value = new_value[:bracketIndex]

                    if value.next_element is not None and str(type(value.next_element)) == "<class 'bs4.element.Tag'>" and "class" in value.next_element.attrs and value.next_element.attrs["class"][0] == "image":
                        new_value = "https:" + \
                            value.next_element.next_element.attrs['src']

                    row_value[columns[index]] = new_value

                if len(row_value) > 0:
                    table_result.append(row_value)

            result.append(table_result)

        if flatten:
            newResult = []
            for table in result:
                newResult = newResult + table

            if topic != "":
                result = {
                    topic: newResult
                }
            else:
                result = newResult

        return result


if __name__ == "__main__":
    app.run()
