import axios from "axios";
import cheerio from "cheerio";
import _  from "lodash";
import fs from "fs";
import FormData from "form-data";

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

interface IFollowersCount {
  count: number;
}

interface ISocialInsight {
  twitter: number,
  facebook: number,
  instagram: number,
  reddit: number,
  medium: number,
  youtube: number,
}

interface IPastInsight {
  [key: string]: ISocialInsight
}

interface CurrentInsight {
  followers: ISocialInsight,
  timeStamp: number,
}

interface ITwitterResponse {
  following: boolean,
  id: string,
  screen_name: string,
  name: string,
  protected: boolean,
  followers_count: number,
  formatted_followers_count: string,
  age_gated: boolean
}



const instagram = async () : Promise<IFollowersCount | undefined>  => {
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
    const followersCount : IFollowersCount = {
      count: followers > following ? followers : following,
    }
    return followersCount;
  } catch (e) {
    console.log(e);
  }
};

const facebookPage = async () : Promise<IFollowersCount | undefined> => {
  try {
    const url = `https://web.facebook.com/plugins/fan.php?connections=100&id=${FACEBOOK_BUSINESS_ID}&_rdc=1&_rdr`;
    const response = await axios.get(url, CONFIG);
    const body = response.data;
    const $ = cheerio.load(body);
    let followersCount = $("div[class=_1drq]").text().split("followers")[0];
    followersCount = followersCount.replace(/\./g, "").replace(",", "");
    return  { count: +followersCount };
  } catch (e) {
    console.log(e);
  }
};

const twitter = async () : Promise<IFollowersCount | undefined> => {
  try {
    const response = await axios.get(
      `https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=${TWITTER_SCREEN_NAME}`,
      CONFIG
    );
    const data = response?.data[0] as ITwitterResponse; 
    return { count: data.followers_count };
  } catch (e) {
    console.log(e);
  }
};

const reddit = async () : Promise<IFollowersCount | undefined>=> {
  try {
    const statusRes = await axios.get(
      `https://www.reddit.com/r/${REDDIT_NAME}/about.json`,
      CONFIG
    );
    const {
      data: { subscribers },
    } = statusRes.data;
    return { count: subscribers };
  } catch (e) {
    console.log(e);
  }
};

const medium = async () : Promise<IFollowersCount | undefined> => {
  const res = await axios.get(
    `https://medium.com/${MEDIUM_NAME}?format=json`,
    CONFIG
  );
  const data = JSON.parse(res.data.replace("])}while(1);</x>", ""));
  const userId = _.get(data, "payload.user.userId");
  return {
    count: _.get(
      data,
      `payload.references.SocialStats.${userId}.usersFollowedByCount`,
      null
    ),
  };
};

const youtube = async () : Promise<IFollowersCount | undefined> => {
  try {
    const url = `https://www.youtube.com/subscribe_embed?channelid=${YOUTUBE_CHANNEL_ID}`;
    const response = await axios.get(url, CONFIG);
    const $ = cheerio.load(response.data);
    let followersCount = +$("span[role=button]").text();
    return { count: followersCount };
  } catch (e) {
    console.log(e);
  }
};

const path = require("path");

const dailyInsights = async () => {
  const currentInsights: CurrentInsight = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname + "../../../src/data/current_insights.json")
    ).toString()
  );

  const twitterInsight = await twitter();
  const instagramInsight = await instagram();
  const facebookInsight = await facebookPage();
  const redditInsight = await reddit();
  const mediumInsight = await medium();
  const youtubeInsight = await youtube();

  const newInsights : ISocialInsight = {
    twitter: twitterInsight?.count || currentInsights.followers.twitter,
    facebook: facebookInsight?.count || currentInsights.followers.facebook,
    instagram: instagramInsight?.count || currentInsights.followers.instagram,
    reddit: redditInsight?.count || currentInsights.followers.reddit,
    medium: mediumInsight?.count || currentInsights.followers.medium,
    youtube: youtubeInsight?.count || currentInsights.followers.youtube,
  };
  const compareInsights = compare(currentInsights.followers, newInsights);
  const pastInsights : IPastInsight = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname + "../../../src/data/past_insights.json")
    ).toString()
  );
  const today = new Date().getTime();
  pastInsights[today] = newInsights;

  let processedPastInsight : IPastInsight = {};
  if (Object.keys(pastInsights).length > 720 ) {
    const keys = Object.keys(pastInsights).sort((a : string, b: string) => +b - +a);
    for (let i = 720; i >= 0; i -= 1) {
      processedPastInsight[keys[i]] = pastInsights[keys[i]]
    }
  } else {
    processedPastInsight = pastInsights;
  }

  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/compare_insights.json"),
    JSON.stringify(compareInsights, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/past_insights.json"),
    JSON.stringify(processedPastInsight, null, 2)
  );
  fs.writeFileSync(
    path.resolve(__dirname + "../../../src/data/current_insights.json"),
    JSON.stringify({
      followers: newInsights,
      timeStamp: today,
    }, null, 2)
  );
};


const compare = (old: ISocialInsight, current: ISocialInsight) => {
  const result: ISocialInsight = { ...old };
  type ObjectKey = keyof typeof old;
  const keys : ObjectKey[] = Object.keys(old) as ObjectKey[];
  for (const key of keys) {
    result[key] = (current[key] || 0) - (old[key] || 0);
  }
  return result;
};

dailyInsights();
