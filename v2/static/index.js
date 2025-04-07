const feeds = [...new Set(analyticsData.map(item => item.feed))]
const traces = feeds.map(feed => {
  const filteredData = analyticsData.filter(item => item.feed === feed)
  const dates = filteredData.map(item => new Date(item.day).toLocaleDateString())
  const views = filteredData.map(item => item.views)

  return {
    x: dates,
    y: views,
    type: 'scatter',
    mode: 'lines+markers',
    name: feed,
    hovertemplate: feed + ' on %{x}: ' +
      '<b>%{y} views</b>' + '<extra></extra>',
  }
})

const layout = {
  title: 'Views Over Time',
  xaxis: {
    title: 'Date',
    tickangle: -45,
  },
  yaxis: {
    title: 'Views',
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
    borderwidth: 0
  },
}

Plotly.newPlot('chart', traces, layout)
