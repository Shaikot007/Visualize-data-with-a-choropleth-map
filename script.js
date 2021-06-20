const education_url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const county_url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

d3.json(county_url).then(
  (data, error) => {
    if (error) {
      console.error();
    }
    else {
      county_data = topojson.feature(data, data.objects.counties).features;
      d3.json(education_url).then(
        (data, error) => {
          if (error) {
            console.error();
          }
          else {
            education_data = data;
            drawMap();
          }
        }
      )
    }
  }
)

let tooltip = d3.select("body")
                .append("div")
                .attr("id", "tooltip")
                .style("opacity", 0)
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "center")
                .style("position", "absolute")
                .style("text-align", "center")
                .style("width", "auto")
                .style("height", "auto")
                .style("padding", "6px")
                .style("font-size", "12px")
                .style("background-color", "rgba(255, 255, 204, 0.9)")
                .style("box-shadow", "1px 1px 10px rgba(128, 128, 128, 0.6)")
                .style("border-radius", "2px")
                .style("pointer-events", "none");

function drawMap() {
  d3.select(".svg-content")
    .selectAll("path")
    .data(county_data)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", data => {
      const fips = data["id"];
      const county = education_data.find(county => {
        return county["fips"] === fips;
      });
      const maxPercentage = d3.max(education_data, data => data["bachelorsOrHigher"]);
      const minPercentage = d3.min(education_data, data => data["bachelorsOrHigher"]);
      const color = d3.scaleThreshold()
                      .domain(d3.range(minPercentage, maxPercentage, (maxPercentage - minPercentage) / 8))
                      .range(d3.schemeGreens[9]);

      return color(county["bachelorsOrHigher"]);
    })
    .attr("data-fips", data => {
      return data["id"];
    })
    .attr("data-education", data => {
      const fips = data["id"];
      const county = education_data.find(county => {
        return county["fips"] === fips;
      });
      return county["bachelorsOrHigher"];
    })
    .on("mouseover", (data, index) => {
      tooltip.transition()
             .style("opacity", 1)
             .style("left", data.pageX + "px")
             .style("top", data.pageY + "px");

        const fips = index["id"];
        const county = education_data.find(county => {
          return county["fips"] === fips;
        });

      document.querySelector("#tooltip").setAttribute("data-education", county["bachelorsOrHigher"]);
      document.querySelector("#tooltip").innerHTML = county["area_name"] + ", " + county["state"] + ": " + county["bachelorsOrHigher"] + "%";
   })
   .on("mouseout", () => {
      tooltip.transition()
             .style("opacity", 0);
   });
}
