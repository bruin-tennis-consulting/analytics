d3.json("../../../../data/json/summary_stats.json").then(function(data) {
    const playerNames = Object.keys(data[0])
        .filter(name => name !== "Stat" && name !== "isProp" && name !== "isRallyStat");

    d3.select("#header")
        .append("h2")
        .attr("class", "match-header")
        .text(`${playerNames[0]} vs ${playerNames[1]}`);

});