const processData = (data) => {
  const xScale = [];
  const dataSets = [
    {
      label: "Twitter",
      data: [],
      fill: false,
      backgroundColor: "#8a3ab9",
      borderColor: "#8a3ab9",
    },
    {
      label: "Facebook",
      data: [],
      fill: false,
      backgroundColor: "#4c68d7",
      borderColor: "#4c68d7",
    },
    {
      label: "Instagram",
      data: [],
      fill: false,
      backgroundColor: "#e95950",
      borderColor: "#e95950",
    },
    {
      label: "Reddit",
      data: [],
      fill: false,
      backgroundColor: "#cd486b",
      borderColor: "#cd486b",
    },
    {
      label: "Medium",
      data: [],
      fill: false,
      backgroundColor: "#00FF00",
      borderColor: "#00FF00",
    },
    {
      label: "Youtube",
      data: [],
      fill: false,
      backgroundColor: "#FF0000",
      borderColor: "#FF0000",
    },
  ];

  const accounts = ["twitter", "facebook", "instagram", "reddit", "medium", 'youtube'];
  for (const timeStamp in data) {
    xScale.push(new Date(+timeStamp));

    for (const accountIndex in accounts) {
      dataSets[accountIndex].data.push(data[timeStamp][accounts[accountIndex]]);
    }
  }
  return {
    xScale,
    dataSets,
  };
};

export default processData;
