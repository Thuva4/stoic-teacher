const axios = require("axios").default;
const cheerio = require("cheerio");
const _ = require("lodash");
const fs = require("fs");
const FormData = require("form-data");

const FACEBOOK_BUSINESS_ID = "113633627183646";
const INSTAGRAM_SCREEN_NAME = "_stoicteacher";
const TWITTER_SCREEN_NAME = "_stoicteacher";
const REDDIT_NAME = "stoicteacher";
const MEDIUM_NAME = "@stoicteacher";
const YOUTUBE_CHANNEL_ID = "UC-B8QLGS3SlUNTeaa3inCjg";

const CONFIG = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0",
  },
};

const instagram = async () => {
  const form = new FormData();
  form.append("username", INSTAGRAM_SCREEN_NAME);
  try {
    const response = await axios.post(
      `https://business.notjustanalytics.com/analyze/getProfileInfo`,
      form,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
          "Content-Length": form.getLengthSync(),
          Host: "business.notjustanalytics.com",
        },
      }
    );
    const followers =  +_.get(
      response.data,
      "follower"
    );

    const following =  +_.get(
      response.data,
      "following"
    )
    return {
      followersCount: followers > following ? followers : following,
    };
  } catch (e) {
    console.log(e);
  }
};

const facebookPage = async () => {
  try {
    const url = `https://web.facebook.com/plugins/fan.php?connections=100&id=${FACEBOOK_BUSINESS_ID}&_rdc=1&_rdr`;
    const response = await axios.get(url, CONFIG);
    const body = response.data;
    const $ = cheerio.load(body);
    let followersCount = $("div[class=_1drq]").text().split("followers")[0];
    followersCount = +followersCount.replace(/\./g, "").replace(",", "");
    return { followersCount };
  } catch (e) {
    console.log(e);
  }
};

const twitter = async () => {
  try {
    const statusRes = await axios.get(
      `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${TWITTER_SCREEN_NAME}`,
      CONFIG
    );
    return { followersCount: statusRes.data[0].followers_count };
  } catch (e) {
    console.log(e);
  }
};

const reddit = async () => {
  try {
    const statusRes = await axios.get(
      `https://www.reddit.com/r/${REDDIT_NAME}/about.json`,
      CONFIG
    );
    const {
      data: { subscribers },
    } = statusRes.data;
    return { followersCount: subscribers };
  } catch (e) {
    console.log(e);
  }
};

const medium = async () => {
  const res = await axios.get(
    `https://medium.com/${MEDIUM_NAME}?format=json`,
    CONFIG
  );
  const data = JSON.parse(res.data.replace("])}while(1);</x>", ""));
  const userId = _.get(data, "payload.user.userId");
  return {
    followersCount: _.get(
      data,
      `payload.references.SocialStats.${userId}.usersFollowedByCount`,
      null
    ),
  };
};

const youtube = async () => {
  try {
    const url = `https://www.youtube.com/subscribe_embed?channelid=${YOUTUBE_CHANNEL_ID}`;
    const response = await axios.get(url, CONFIG);
    const $ = cheerio.load(response.data);
    let followersCount = +$("span[role=button]").text();
    return { followersCount };
  } catch (e) {
    console.log(e);
  }
};

const path = require("path");

const dailyInsights = async () => {
  const {followers: currentInsights} = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname + "../../../src/data/current_insights.json")
    )
  );

  const twitterInsight = await twitter();
  const instagramInsight = await instagram();
  const facebookInsight = await facebookPage();
  const redditInsight = await reddit();
  const mediumInsight = await medium();
  const youtubeInsight = await youtube();

  const newInsights = {
    twitter: twitterInsight?.followersCount || currentInsights.twitter,
    facebook: facebookInsight?.followersCount || currentInsights.facebook,
    instagram: instagramInsight?.followersCount || currentInsights.instagram,
    reddit: redditInsight?.followersCount || currentInsights.reddit,
    medium: mediumInsight?.followersCount || currentInsights.medium,
    youtube: youtubeInsight?.followersCount || currentInsights.youtube,
  };
  const compareInsights = compare(currentInsights, newInsights);
  const pastInsights = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname + "../../../src/data/past_insights.json")
    )
  );
  const today = new Date().getTime();
  pastInsights[today] = newInsights;

  let processPastInsight = {};
  if (Object.keys(pastInsights).length > 720 ) {
    const keys = Object.keys(pastInsights).sort((a, b) => b - a);
    for (let i = 720; i >= 0; i -= 1) {
      processPastInsight[keys[i]] = pastInsights[keys[i]]
    }
  } else {
    processPastInsight = pastInsights;
  }

  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/compare_insights.json"),
    JSON.stringify(compareInsights, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/past_insights.json"),
    JSON.stringify(processPastInsight, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/current_insights.json"),
    JSON.stringify({followers: newInsights, timeStamp: today}, null, 2)
  );
};

const compare = (old, current) => {
  const result = {};
  for (const key in old) {
    if (old[key] instanceof Object) {
      result[key] = compare(old[key], current[key]);
    } else {
      result[key] = (current[key] || 0) - (old[key] || 0);
    }
  }
  return result;
};

dailyInsights();
