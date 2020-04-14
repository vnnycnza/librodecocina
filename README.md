# librodecocina
![](https://media.giphy.com/media/zzX3QOVa4qvte/giphy.gif)
**Libro De Cocina** is `recipe book` in Spanish.
This app is a simple implementation of retrieving recipes from [r/GifRecipes](https://www.reddit.com/r/GifRecipes/).


## Application
The app has two components: _a simple api & a telegram bot_.

### Recipes API
https://librodecocina.herokuapp.com/api/recipes?search=[keyword]

#### Request Parameters

| key     | type   | description                   |
| --------| -------| ------------------------------|
| search  | string | Keyword to search for         |

#### Response Body

| key           | type    | description                   |
| --------------| ------- | ------------------------------|
| search        | string  | Keyword searched on           |
| results       | array   | array containing `result`     |
| result.title  | string  | title of recipe               |
| result.url    | string  | url of recipe                 |
| result.gif    | string  | gif url of recipe             |

#### Sample Request
```
GET https://librodecocina.herokuapp.com/api/recipes?search=chicken HTTP/1.1
Host: librodecocina.herokuapp.com
```

#### Sample Response
```
{
  "search": "chicken",
  "result": [
    {
      "title": "Baked Tomato And Balsamic Chicken",
      "url": "https://gfycat.com/madeupgreenharrierhawk",
      "gif": "https://thumbs.gfycat.com/MadeupGreenHarrierhawk-size_restricted.gif"
    }
  ]
}
```

### Telegram Bot
Try out the bot by opening this link in your Telegram app
https://t.me/LookForRecipeBot

#### Features
Send any keyword and (_hopefully, if there are matches_) it will reply something like this:

![](https://media.giphy.com/media/104jNEKMbRwpzO/giphy.gif)
*_let's hope it'll respond with legit recipes_ 😅

#### Bot Keywords
- **[keyword]** - searches in r/gifrecipes then sends a gif
- **/help** - shows help
- **/start** - shows help

## Tech Stack & Resources
- [Node.js](https://nodejs.org/en/)
- [Snoowrap](https://github.com/not-an-aardvark/snoowrap)
- [Telegram Bot Module](https://github.com/yagop/node-telegram-bot-api)
- [Express](https://expressjs.com/)
- [Heroku](https://www.heroku.com/)
- [r/GifRecipes](https://www.reddit.com/r/GifRecipes/)

## Environment Variables

| key                   | description                        |
| ----------------------| -----------------------------------|
| TELEGRAM_TOKEN        | Telegram Bot Token                 |    
| REDDIT_USER_AGENT     | Reddit User Agent                  |     
| REDDIT_CLIENT_ID      | Reddit Client ID                   |        
| REDDIT_CLIENT_SECRET  | Reddit Client Secret               |     
| REDDIT_USERNAME       | Reddit Username                    | 
| REDDIT_PASSWORD       | Reddit Password                    |
| NODE_ENV              | defaults to `development`          |
| URL                   | defaults to `http://localhost:3001`|

## Running the app locally
Export the environment variables listed above
```
$ cd salingwika
$ npm ci
$ export URL=http://localhost:3001
$ export TELEGRAM_TOKEN=<TELEGRAM_TOKEN>
$ export ...all other env vars
$ npm start
```
App will run locally in `http://localhost:3001`

## Production
The app is deployed via `Heroku` and can be accessed [HERE](https://librodecocina.herokuapp.com/).



