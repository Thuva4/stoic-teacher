import React from "react";

import CardLineChart from "components/Cards/CardLineChart.js";
import HeaderStats from "components/Headers/HeaderStats";
import processData from "utils/Insights";

import pastInsights from "../data/past_insights.json";

export default function Dashboard() {
  const [charts, setCharts] = React.useState([]);
  React.useEffect(() => {
    const { xScale, dataSets } = processData(pastInsights);
    for (const dataSet of dataSets) {
      setCharts((charts) => [
        ...charts,
        <CardLineChart xScale={xScale} dataSet={dataSet} key={dataSet.label} />,
      ]);
    }
  }, []);
  return (
    <>
      <HeaderStats />
      <div className="flex flex-wrap">
        <div className="w-full mb-12 xl:mb-0 px-4 flex flex-wrap">{charts}</div>
      </div>
    </>
  );
}
