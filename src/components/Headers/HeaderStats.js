import React from "react";

// components

import CardStats from "components/Cards/CardStats.js";
import compareInsights from "../../data/compare_insights.json";
import { followers, timeStamp } from "../../data/current_insights.json";
export default function HeaderStats() {
  const cards = [];
  const currentTime = new Date().getTime()
  const dateString = Math.floor((currentTime - timeStamp)/(1000 * 60));
  for (const account in compareInsights) {
    cards.push(
      <div className="w-full lg:w-3/12 xl:w-3/12 px-4 m-2">
        <CardStats
          statSubtitle={account}
          stat={followers[account]}
          change={compareInsights[account]}
          statDescripiron={`Last run ${dateString} Minutes ago`}
          statIconName="far fa-chart-bar"
          statIconColor="bg-red-500"
        />
      </div>
    );
  }
  return (
    <>
      {/* Header */}
      <div className="relative bg-lightBlue-600">
        <div className="px-4 md:px-10 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap  justify-center items-center">
              {cards}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
