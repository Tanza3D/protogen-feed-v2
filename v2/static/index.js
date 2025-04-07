// Generate traces for views chart
const feeds = [...new Set(analyticsData['views'].map(item => item.feed))];

// Traces for views chart
const viewsTraces = feeds.map(feed => {
  const filteredData = analyticsData['views'].filter(item => item.feed === feed);
  const dates = filteredData.map(item => new Date(item.day).toLocaleDateString());
  const views = filteredData.map(item => item.views);

  return {
    x: dates,
    y: views,
    type: 'scatter',
    mode: 'lines+markers',
    name: feed,
    hovertemplate: feed + ' on %{x}: ' +
      '<b>%{y} views</b>' + '<extra></extra>',
  };
});

// Traces for posts chart
const postsTraces = feeds.map(feed => {
  const filteredData = analyticsData['posts'].filter(item => item.feed === feed);
  const dates = filteredData.map(item => new Date(item.day).toLocaleDateString());
  const postCounts = filteredData.map(item => item.post_count);

  return {
    x: dates,
    y: postCounts,
    type: 'scatter',
    mode: 'lines+markers',
    name: feed,
    hovertemplate: feed + ' on %{x}: ' +
      '<b>%{y} posts</b>' + '<extra></extra>',
  };
});

// Common layout for both charts
const commonLayout = {
  title: 'Analytics Over Time',
  xaxis: {
    title: 'Date',
    tickangle: -45,
  },
  yaxis: {
    title: 'Count',
  },
  margin: {
    t: 20,
    r: 0,
    b: 70,
    l: 30,
  },
  hovermode: 'x',
  hoverlabel: {
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: '#fff',
    },
    bordercolor: 'rgba(0,0,0,0)',
    borderwidth: 0,
  },
};

// Plot Views chart
Plotly.newPlot('chart', viewsTraces, commonLayout);

// Plot Posts chart
Plotly.newPlot('chart2', postsTraces, commonLayout);
