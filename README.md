# Ultimate Fight Predictor Front End
BE AWARE that this only works when I'm running my home server(Most of the time I'm not running it.)

## Features
- Use my [Tapology parser](https://github.com/angel-721/tapology-python-parser) to gather fighter information
- Use the [UFP Model](https://github.com/angel-721/UFP) to predict the outcome of fights
- Save outcomes for future trainning of mma machine learning models. Data is saved as a csv file.

## Architecture 
### Front-End(This Repo)
  - Vue.js(CDN)
  - HTML
  - CSS
  - Javascript
### Back-End(Private... for now)
  - Node.js
  - Express
  - Python(For parser and machine learning model)

## REST Endpoints
Name                           | Method | Path
-------------------------------|--------|------------------
Retrieve savedfights collection| GET   | /savedfights
Create savedfights member| POST   | /savedfights
Delete savedfights member| DELETE  | /savedfights<id>
Update savedfights collection| PATCH  | /savedfights
Create prediction| POST  | /predictions
Create fight| POST  | /fights
Retrieve savedfights collection as csv| GET  | /datasets
### Parse Data:
![Ufp](https://github.com/angel-721/ultimate-fight-predictor/assets/75283919/ba9ce09d-db44-40d9-a8c1-c43809d693bc)

### Predict the Outcome of a Bout:
![outcome](https://github.com/angel-721/ultimate-fight-predictor/assets/75283919/489253c2-2c5d-4106-9d81-632be7d38421)
