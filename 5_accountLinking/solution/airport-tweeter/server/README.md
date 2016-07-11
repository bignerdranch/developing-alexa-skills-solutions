### Alexa Twitter OAuth account linking example

This repo contains a simple web app for account linking a twitter user with an alexa skill.
live at: 
https://alexa-twitter-airport-info.herokuapp.com/

#### Skill Configuration

1. Upload the skill code contained in the `skill` directory to a new AWS Lambda instance. For instructions on how to set up a Lambda instance, refer to :
[https://www.bignerdranch.com/blog/developing-alexa-skills-locally-with-nodejs-deploying-your-skill-to-staging/](https://www.bignerdranch.com/blog/developing-alexa-skills-locally-with-nodejs-deploying-your-skill-to-staging/)
2. Set up a new skill instance for the skill at https://developer.amazon.com/edw/home.html#/skills/list called 'Tweeter'. Refer to the Readme in the `/skill` directory for details.
3. On the `configuration` page, select "Yes" for Account Linking.
4. Enter [https://localhost:3000/oauth/request_token](https://localhost:3000/oauth/request_token) for Authorization URL.
5. Take note of the `vendorId` value under "Redirect URL". Copy this value, and update the VENDOR_ID attribute in the .env.example file

#### Server Setup

1. Register a new application with Twitter. You will need to register a twitter developer account to do this. 
2. Copy the consumer key and consumer secret values, and update
the respective values in .env.example.
3. Copy .env.example to .env
4. The example uses `ruby 2.3.0` and `bundler`. Install `ruby 2.3.0` and ensure `bundler` is installed. 
If it is not, run `gem install bundler`.
5. Within the server directory, run `bundle`
6. within the server directory, run `thin start --ssl -p 3000`
