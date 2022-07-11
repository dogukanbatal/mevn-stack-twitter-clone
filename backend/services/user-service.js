const MongooseService = require('./mongoose-service')
const TweetService = require('./tweet-service')
const UserModel = require('../models/user')

class UserService extends MongooseService {
   async newTweet(user, tweetContent) {
      const tweet = await TweetService.insert({
         author: user,
         content: tweetContent,
      })
      user.tweets.push(tweet)
      await user.save()
      return tweet
   }

   async removeTweet(user, tweetId) {
      try {
         await TweetService.removeOne('_id', tweetId)
         const filteredTweets = await user.tweets.filter((tweet) => tweet.id != tweetId)
         user.tweets = filteredTweets
         await user.save()
      } catch (error) {
         throw new Error(error)
      }
   }

   async likeTweet(user, tweetId) {
      const tweet = await TweetService.find(tweetId)

      user.likes.push(tweet)
      tweet.likes.push(user)

      await user.save()
      await tweet.save()
   }

   async reTweet(user, tweetId, content) {
      const retweet = await TweetService.insert({
         author: user,
         content: content,
      })

      const originalTweet = await TweetService.find(tweetId)
      retweet.originalTweet = originalTweet

      user.tweets.push(retweet)
      user.retweets.push(originalTweet)
      originalTweet.retweets.push(retweet)

      await retweet.save()
      await originalTweet.save()
      await user.save()
   }
}

module.exports = new UserService(UserModel)
