# alphaville-es-interface-service
Microservice for alphaville-es-interface

## Install
You'll need to create environment variable
The fastest way to do this is to run the following assuming your are logged in into heroku CLI:

```
heroku config -s  >> .env --app av2-es-interface-test
```

Run the following:

```
npm install
```

## Start the app

Run the following:

```
heroku local
```

### Using alpavhille services together

If you'd like to use other alphaville services locally with the ES service app (alphaville-marketslive-service), then you'll need to change their relevant environment variable (key, URL):

- `ML_API_URL` for *alphaville-marketslive-service*
