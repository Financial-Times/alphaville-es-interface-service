# NO LONGER IN USE.
**All Alphaville articles are now rendered as article content on FT.com**

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

## Rotate AWS Keys

AWS keys need to be manually updated in both Vault and Heroku.

1. Update keys in the [`alphaville-es-interface-service` folder in `Vault`](https://vault.in.ft.com:8080/ui/vault/secrets/secret/list/teams/next/alphaville-es-interface-service/). The keys stored in Vault are used by CircleCI.

2. Update keys in the production app in [Heroku](https://dashboard.heroku.com/apps/av2-es-interface-prod).
