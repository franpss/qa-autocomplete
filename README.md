# Templet

Templet (an alternative way of writing template) is a Flask app developed by Francisca Suárez, with the guidance of Professor Aidan Hogan, in the context of the work Autocompleting questions on Wikidata. It consists of a web platform of questions and answers, with a main natural language text input from the user, which is autocompleted to guide and predetermine the structure of the query. This autocomplete is fed from the collection of questions available at [QAWiki](http://qawiki.org), previously transformed into templates. For example, the question Who played Eleven in Stranger Things? ([Q11](http://qawiki.org/wiki/Item:Q11) on QAWiki) is transformed to Who played (...) in (...)?. Clicking on one of these templates displays a new form with a text input field for each template entity. These text entries refer directly to the Wikidata API and also have autocompletion, allowing the selection of new entities to replace in the question. Finally, the selected entities are mapped to the SPARQL query and it is executed in the Wikidata Query Service, obtaining the result.

The motivation of this platform is to offer an interactive demo of QAWiki to users. In this way, its use and contribution can be expanded, achieving a broader and more diverse collection of pairs of questions and queries, which can be used, in the future, for training deep neural networks.

# Getting started

Docker installs all the dependencies needed to deploy Templet. The only requirement is to have Docker (and docker-compose) installed. 

To deploy the application, run the following commands:

```shell
$ docker-compose build
$ docker-compose up
```
