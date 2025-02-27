export class DataPoint {
  name: string;
  value: string;
  description?: string;
  nonNormalValue?: string;
}

export const imageDirectory = {
  "11.1.1": "public/images/axis-icons/sdg-11.1.1.png",
  "11.2.1": "public/images/axis-icons/sdg-11.2.1.png",
  "11.3.1": "public/images/axis-icons/sdg-11.3.1.png",
  "11.3.2": "public/images/axis-icons/sdg-11.3.2.png",
  "11.4.1": "public/images/axis-icons/sdg-11.4.1.png",
  "11.5.1": "public/images/axis-icons/sdg-11.5.1.2.png",
  "11.5.2": "public/images/axis-icons/sdg-11.5.2.png",
  "11.6.1": "public/images/axis-icons/sdg-11.6.1.png",
  "11.6.2": "public/images/axis-icons/sdg-11.6.2.png",
  "11.7.1": "public/images/axis-icons/sdg-11.7.1.png",
  "11.7.2": "public/images/axis-icons/sdg-11.7.2.png",
};

export class DataModel {
  name: string;
  data: DataPoint[];
}

export class Data {
  /** Return the max value of all DataModel.DataPoint.values */
  static getAbsoluteMax(data: DataModel[]): number {
    const nonFlatArrOfNumbers = data.map((d) =>
      d.data.map((x) => Number(x.value))
    );
    return Math.max(...this.flat(nonFlatArrOfNumbers));
  }

  private static flat(nestedArray: number[][]): number[] {
    return [].concat.apply([], nestedArray);
  }

  /** Given a DataModel[], get the max value of every common data.name variable */
  static getMaxPerVariable(data: DataModel[]): number[] {
    return this.runOperationOnGroupOfVariables(data, Math.max);
  }

  /** Given a DataModel[], get the min value of every common data.name variable */
  static getMinPerVariable(data: DataModel[]): number[] {
    return this.runOperationOnGroupOfVariables(data, Math.min);
  }

  private static runOperationOnGroupOfVariables(data: DataModel[], operation) {
    const numberMatrix = data.map((d) => d.data.map((x) => Number(x.value)));
    let maxOfVariable: number[] = [];
    for (let i in numberMatrix[0]) {
      let groupValuesByVariable = numberMatrix.map((d) => d[i]);
      maxOfVariable.push(operation(...groupValuesByVariable));
    }
    return maxOfVariable;
  }

  /**
   * \brief   Averages the city data.
   * @param   cityData : The array of DataPoint describing the city.
   * @returns Returns the arithmetic mean of the city's DataPoint values.
   */
  static getArithmenticMeanForCity(cityData: DataPoint[]): number {
    if (cityData.length <= 0) {
      return 0;
    }

    let sum = 0.0;
    let numElements = 0;
    cityData.forEach((d) => addDataPointElement(d.value));
    function addDataPointElement(dataPointValue: string) {
      sum += parseFloat(dataPointValue);
      ++numElements;
    }
    let avg = sum / numElements;
    return avg;
  }

  /**
   * Calculate a pseudo geomtric mean, applying the usual formula with two alterations:
   * If any value is zero (0), one is added to each value in the set and then one is 
   * subtracted from the result
   * @param cityData The array of DataPoint describing the city.
   * @returns Returns the psudo-geometric mean of the city's DataPoint values.
   */
  static getPseudoGeometricMeanForCity(cityData: DataPoint[]): number {
    let root = cityData.length
    if (root < 1) return 0;
    let dataValues = cityData.map((x) => Number(x.value) + 1)
    let agg = dataValues.reduce((a, b) => a * b);
    return Math.pow(agg, 1/root) - 1;
  }

  /**
   * @brief   Gets a representation of the country where every city is an average of its data points.
   * @param   averageCityFunction : Determines whether to calculate average by mean, median, or something else.
   * @returns Returns an array of DataPoints, where each DataPoint is an averaged city.
   */
  static getAverageCountry(averageCityFunction: Function): DataPoint[] {
    let countryData = Data.getSyncData();
    let meanCountryData: DataPoint[] = [];
    countryData.forEach((d) => addMeanCity(d));

    function addMeanCity(cityData: DataModel) {
      let dataValue = averageCityFunction(cityData.data);
      // prettier-ignore
      let citySummary:  DataPoint = {
        name:           cityData.name,
        description:    "",
        value:          dataValue.toString(),
        nonNormalValue: dataValue.toFixed(4).toString()
      };
      meanCountryData.push(citySummary);
    }

    meanCountryData.sort(Data.compareDataPoints);
    return meanCountryData;
  }

  static get_condorcet_ranking_all_variables(): DataPoint[] {
    return [
      { name: "Windsor", description: "Windsor", value: "0.1", nonNormalValue: "0"},
      { name: "St. John's", description: "St. John's", value: "0.2", nonNormalValue: "1"},
      { name: "St. Catharines, Niagara", description: "St. Catharines, Niagara", value: "0.2", nonNormalValue: "1"},
      { name: "Halifax", description: "Halifax", value: "0.2", nonNormalValue: "1"},
      { name: "Montréal", description: "Montréal", value: "0.3", nonNormalValue: "4"},
      { name: "Regina", description: "Regina", value: "0.4", nonNormalValue: "5"},
      { name: "Hamilton", description: "Hamilton", value: "0.4", nonNormalValue: "5"},
      { name: "Quebec City", description: "Quebec City", value: "0.4", nonNormalValue: "5"},
      { name: "Sherbrooke", description: "Sherbrooke", value: "0.5", nonNormalValue: "6"},
      { name: "Toronto", description: "Toronto", value: "0.5", nonNormalValue: "6"},
      { name: "Kitchener, Cambridge, Waterloo", description: "Kitchener, Cambridge, Waterloo", value: "0.5", nonNormalValue: "6"},
      { name: "Saskatoon", description: "Saskatoon", value: "0.5", nonNormalValue: "6"},
      { name: "Winnipeg", description: "Winnipeg", value: "0.5", nonNormalValue: "6"},
      { name: "London", description: "London", value: "0.6", nonNormalValue: "7"},
      { name: "Edmonton", description: "Edmonton", value: "0.7", nonNormalValue: "12"},
      { name: "Victoria", description: "Victoria", value: "0.8", nonNormalValue: "13"},
      { name: "Vancouver", description: "Vancouver", value: "0.9", nonNormalValue: "14"},
      { name: "Calgary", description: "Calgary", value: "1", nonNormalValue: "17"},
    ]
  }

  /**
   * @brief   Compares the values of two DataPoints. Useful for sorting funtions.
   * @param   a : The first DataPoint to compare.
   * @param   b : The second DataPoint to compare.
   * @returns Returns:
   *            - -1 if a < b
   *            - +1 if a > b
   *            - 0 if a == b
   */
  static compareDataPoints(a: DataPoint, b: DataPoint): number {
    if (a.value < b.value) {
      return -1;
    } else if (a.value > b.value) {
      return 1;
    }
    return 0;
  }

  /**
   * @returns   Returns all geographic data as an array of Data Model.
   * \details   Each DataModel element pertains to one city, and has a name and data property.
   *              - The data property is an array of DataPoint
   *              - Each DataPoint has three strings (name, desc, value) for the bar plot.
   */
  static getSyncData(): DataModel[] {
    let countryData: DataModel[] = [
      {
        name: "St. John's",
        data: [
          {
            name: "11.1.1",
            value: "0.397905759",
            nonNormalValue: "11.5%",
          },
          {
            name: "11.2.1",
            value: "0",
            nonNormalValue: "59.9%",
          },
          {
            name: "11.3.1",
            value: "0.41912307",
            nonNormalValue: "2.8",
          },
          {
            name: "11.3.2",
            value: "0.583333333",
            nonNormalValue: "3.75 out of 5",
          },
          {
            name: "11.4.1",
            value: "0",
            nonNormalValue: "$893",
          },
          {
            name: "11.5.1",
            value: "0.735469986",
            nonNormalValue: "39,627",
          },
          {
            name: "11.5.2",
            value: "0.974706398",
            nonNormalValue: "$43,180,205",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.196",
            nonNormalValue: "5.1",
          },
          {
            name: "11.7.1",
            value: "0.158003141",
            nonNormalValue: "25.4%",
          },
          {
            name: "11.7.2",
            value: "0.59430496",
            nonNormalValue: "66.25",
          },
        ],
      },
      {
        name: "Halifax",
        data: [
          {
            name: "11.1.1",
            value: "0.282722513",
            nonNormalValue: "13.7%",
          },
          {
            name: "11.2.1",
            value: "0.274314214",
            nonNormalValue: "70.9%",
          },
          {
            name: "11.3.1",
            value: "0.401851333",
            nonNormalValue: "2.9",
          },
          {
            name: "11.3.2",
            value: "0.583333333",
            nonNormalValue: "3.75 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.27556745",
            nonNormalValue: "$1,060",
          },
          {
            name: "11.5.1",
            value: "0",
            nonNormalValue: "149,801",
          },
          {
            name: "11.5.2",
            value: "0.990115769",
            nonNormalValue: "$16,873,956",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.2",
            nonNormalValue: "5.0",
          }, 
          {
            name: "11.7.1",
            value: "1.425506519",
            nonNormalValue: "62.4%",
          },
          {
            name: "11.7.2",
            value: "0",
            nonNormalValue: "163.3",
          },
        ],
      },
      {
        name: "Quebec City",
        data: [
          {
            name: "11.1.1",
            value: "0.623036649",
            nonNormalValue: "7.2%",
          },
          {
            name: "11.2.1",
            value: "0.578553616",
            nonNormalValue: "83.1%",
          },
          {
            name: "11.3.1",
            value: "0.555142299",
            nonNormalValue: "2.4",
          },
          {
            name: "11.3.2",
            value: "0.416666667",
            nonNormalValue: "3.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.15587496",
            nonNormalValue: "$988",
          },
          {
            name: "11.5.1",
            value: "0.678591369",
            nonNormalValue: "48,147",
          },
          {
            name: "11.5.2",
            value: "0.990840169",
            nonNormalValue: "$15,637,289",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.072",
            nonNormalValue: "8.2",
          },
          {
            name: "11.7.1",
            value: "0.007207309",
            nonNormalValue: "21.0%",
          },
          {
            name: "11.7.2",
            value: "0.650214329",
            nonNormalValue: "57.12",
          },
        ],
      },
      {
        name: "Sherbrooke",
        data: [
          {
            name: "11.1.1",
            value: "0.623036649",
            nonNormalValue: "7.2%",
          },
          {
            name: "11.2.1",
            value: "0.411471322",
            nonNormalValue: "76.4%",
          },
          {
            name: "11.3.1",
            value: "0.20953882",
            nonNormalValue: "3.5",
          },
          {
            name: "11.3.2",
            value: "0",
            nonNormalValue: "2 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.38804851",
            nonNormalValue: "$1,129",
          },
          {
            name: "11.5.1",
            value: "0.567493002",
            nonNormalValue: "64,790",
          },
          {
            name: "11.5.2",
            value: "0.997588007",
            nonNormalValue: "$4,117,656",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.2",
            nonNormalValue: "5.0",
          },
          {
            name: "11.7.1",
            value: "0.2619344",
            nonNormalValue: "28.4%",
          },
          {
            name: "11.7.2",
            value: "0.543539498",
            nonNormalValue: "74.54",
          },
        ],
      },
      {
        name: "Montreal",
        data: [
          {
            name: "11.1.1",
            value: "0.429319372",
            nonNormalValue: "10.9%",
          },
          {
            name: "11.2.1",
            value: "0.790523691",
            nonNormalValue: "91.6%",
          },
          {
            name: "11.3.1",
            value: "0.542826593",
            nonNormalValue: "2.4",
          },
          {
            name: "11.3.2",
            value: "0.416666667",
            nonNormalValue: "3.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.145046924",
            nonNormalValue: "$981",
          },
          {
            name: "11.5.1",
            value: "0.667494914",
            nonNormalValue: "49,810",
          },
          {
            name: "11.5.2",
            value: "0.952931592",
            nonNormalValue: "$80,353,265",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.116",
            nonNormalValue: "7.1",
          },
          {
            name: "11.7.1",
            value: "0.351016591",
            nonNormalValue: "31.0%",
          },
          {
            name: "11.7.2",
            value: "0.610838947",
            nonNormalValue: "63.55",
          },
        ],
      },
      {
        name: "Toronto",
        data: [
          {
            name: "11.1.1",
            value: "0",
            nonNormalValue: "19.1%",
          },
          {
            name: "11.2.1",
            value: "0.825436409",
            nonNormalValue: "93%",
          },
          {
            name: "11.3.1",
            value: "0.973481553",
            nonNormalValue: "1.1",
          },
          {
            name: "11.3.2",
            value: "0.75",
            nonNormalValue: "4.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.209202403",
            nonNormalValue: "$1,020",
          },
          {
            name: "11.5.1",
            value: "0.724149925",
            nonNormalValue: "41,323",
          },
          {
            name: "11.5.2",
            value: "0.35264643",
            nonNormalValue: "$1,105,135,591",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.12",
            nonNormalValue: "7.0",
          },
          {
            name: "11.7.1",
            value: "0.463506154",
            nonNormalValue: "34.3%",
          },
          {
            name: "11.7.2",
            value: "0.63496632",
            nonNormalValue: "59.61",
          },
        ],
      },
      {
        name: "Hamilton",
        data: [
          {
            name: "11.1.1",
            value: "0.319371728",
            nonNormalValue: "13.0%",
          },
          {
            name: "11.2.1",
            value: "0.528678304",
            nonNormalValue: "81.1%",
          },
          {
            name: "11.3.1",
            value: "0.597523622",
            nonNormalValue: "2.2",
          },
          {
            name: "11.3.2",
            value: "0.916666667",
            nonNormalValue: "4.75 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.226784553",
            nonNormalValue: "$1,031",
          },
          {
            name: "11.5.1",
            value: "0.809926691",
            nonNormalValue: "28,473",
          },
          {
            name: "11.5.2",
            value: "0.991023047",
            nonNormalValue: "$15,325,088",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.088",
            nonNormalValue: "7.8",
          },
          {
            name: "11.7.1",
            value: "0.389477438",
            nonNormalValue: "32.1%",
          },
          {
            name: "11.7.2",
            value: "0.481322719",
            nonNormalValue: "84.7",
          },
        ],
      },
      {
        name: "St. Catharines, Niagara",
        data: [
          {
            name: "11.1.1",
            value: "0.272251309",
            nonNormalValue: "13.9%",
          },
          {
            name: "11.2.1",
            value: "0.523690773",
            nonNormalValue: "80.9%",
          },
          {
            name: "11.3.1",
            value: "0.003333298",
            nonNormalValue: "4.1",
          },
          {
            name: "11.3.2",
            value: "0.5",
            nonNormalValue: "3.5 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.047672447",
            nonNormalValue: "$922",
          },
          {
            name: "11.5.1",
            value: "0.811198662",
            nonNormalValue: "28,283",
          },
          {
            name: "11.5.2",
            value: "0.99515785",
            nonNormalValue: "$8,266,321",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.124",
            nonNormalValue: "6.9",
          },
          {
            name: "11.7.1",
            value: "0.559131955",
            nonNormalValue: "37.1%",
          },
          {
            name: "11.7.2",
            value: "0.536007348",
            nonNormalValue: "75.77",
          },
        ],
      },
      {
        name: "Kitchener, Cambridge, Waterloo",
        data: [
          {
            name: "11.1.1",
            value: "0.403141361",
            nonNormalValue: "11.4%",
          },
          {
            name: "11.2.1",
            value: "0.655860349",
            nonNormalValue: "86.2%",
          },
          {
            name: "11.3.1",
            value: "0.920192018",
            nonNormalValue: "1.2",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.066812117",
            nonNormalValue: "$934",
          },
          {
            name: "11.5.1",
            value: "0.808982728",
            nonNormalValue: "28,615",
          },
          {
            name: "11.5.2",
            value: "0.993778421",
            nonNormalValue: "$10,621,226",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.108",
            nonNormalValue: "7.3",
          },
          {
            name: "11.7.1",
            value: "0.300360055",
            nonNormalValue: "29.5%",
          },
          {
            name: "11.7.2",
            value: "0.480832823",
            nonNormalValue: "84.78",
          },
        ],
      },
      {
        name: "London",
        data: [
          {
            name: "11.1.1",
            value: "0.272251309",
            nonNormalValue: "13.9%",
          },
          {
            name: "11.2.1",
            value: "0.443890274",
            nonNormalValue: "77.7%",
          },
          {
            name: "11.3.1",
            value: "0.647486682",
            nonNormalValue: "2.1",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.22963834",
            nonNormalValue: "$1,033",
          },
          {
            name: "11.5.1",
            value: "0.810418937",
            nonNormalValue: "28,399",
          },
          {
            name: "11.5.2",
            value: "0.994104631",
            nonNormalValue: "$10,064,333",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.128",
            nonNormalValue: "6.8",
          },
          {
            name: "11.7.1",
            value: "0.332143299",
            nonNormalValue: "30.4%",
          },
          {
            name: "11.7.2",
            value: "0.499755052",
            nonNormalValue: "81.69",
          },
        ],
      },
      {
        name: "Windsor",
        data: [
          {
            name: "11.1.1",
            value: "0.387434555",
            nonNormalValue: "11.7%",
          },
          {
            name: "11.2.1",
            value: "0.179551122",
            nonNormalValue: "67.1%",
          },
          {
            name: "11.3.1",
            value: "0.041724498",
            nonNormalValue: "4.0",
          },
          {
            name: "11.3.2",
            value: "0.416666667",
            nonNormalValue: "3.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.319730698",
            nonNormalValue: "$1,087",
          },
          {
            name: "11.5.1",
            value: "0.760131164",
            nonNormalValue: "35,933",
          },
          {
            name: "11.5.2",
            value: "0.996009291",
            nonNormalValue: "$6,812,775",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.068",
            nonNormalValue: "8.3",
          },
          {
            name: "11.7.1",
            value: "0",
            nonNormalValue: "21.0%",
          },
          {
            name: "11.7.2",
            value: "0.593815064",
            nonNormalValue: "66.33",
          },
        ],
      },
      {
        name: "Winnipeg",
        data: [
          {
            name: "11.1.1",
            value: "0.366492147",
            nonNormalValue: "12.1%",
          },
          {
            name: "11.2.1",
            value: "0.705735661",
            nonNormalValue: "88.2%",
          },
          {
            name: "11.3.1",
            value: "0.653474212",
            nonNormalValue: "2.1",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.276811915",
            nonNormalValue: "$1,061",
          },
          {
            name: "11.5.1",
            value: "0.97091365",
            nonNormalValue: "4,357",
          },
          {
            name: "11.5.2",
            value: "0.538371893",
            nonNormalValue: "$788,072,661",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.168",
            nonNormalValue: "5.8",
          },
          {
            name: "11.7.1",
            value: "0.104394005",
            nonNormalValue: "24.0%",
          },
          {
            name: "11.7.2",
            value: "0.392651562",
            nonNormalValue: "99.18",
          },
        ],
      },
      {
        name: "Regina",
        data: [
          {
            name: "11.1.1",
            value: "0.303664921",
            nonNormalValue: "13.3%",
          },
          {
            name: "11.2.1",
            value: "0.760598504",
            nonNormalValue: "90.4%",
          },
          {
            name: "11.3.1",
            value: "0.600212968",
            nonNormalValue: "2.2",
          },
          {
            name: "11.3.2",
            value: "0.083333333",
            nonNormalValue: "2.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.340729319",
            nonNormalValue: "$1,100",
          },
          {
            name: "11.5.1",
            value: "0.954228525",
            nonNormalValue: "6,857",
          },
          {
            name: "11.5.2",
            value: "0.967789841",
            nonNormalValue: "$54,987,869",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.076",
            nonNormalValue: "8.1",
          },
          {
            name: "11.7.1",
            value: "0.60846421",
            nonNormalValue: "38.5%",
          },
          {
            name: "11.7.2",
            value: "0.483343539",
            nonNormalValue: "84.37",
          },
        ],
      },
      {
        name: "Saskatoon",
        data: [
          {
            name: "11.1.1",
            value: "0.382198953",
            nonNormalValue: "11.8%",
          },
          {
            name: "11.2.1",
            value: "0.566084788",
            nonNormalValue: "82.6%",
          },
          {
            name: "11.3.1",
            value: "0.728664635",
            nonNormalValue: "1.8",
          },
          {
            name: "11.3.2",
            value: "0.583333333",
            nonNormalValue: "3.75 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.286369616",
            nonNormalValue: "$1,067",
          },
          {
            name: "11.5.1",
            value: "0.998379091",
            nonNormalValue: "243",
          },
          {
            name: "11.5.2",
            value: "0.957170803",
            nonNormalValue: "$73,116,256",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.128",
            nonNormalValue: "6.8",
          },
          {
            name: "11.7.1",
            value: "0.033952621",
            nonNormalValue: "22%",
          },
          {
            name: "11.7.2",
            value: "0.373116963",
            nonNormalValue: "102.37",
          },
        ],
      },
      {
        name: "Calgary",
        data: [
          {
            name: "11.1.1",
            value: "0.408376963",
            nonNormalValue: "11.3%",
          },
          {
            name: "11.2.1",
            value: "0.72319202",
            nonNormalValue: "88.9%",
          },
          {
            name: "11.3.1",
            value: "1.037835577",
            nonNormalValue: "0.9",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.624227317",
            nonNormalValue: "$1,272",
          },
          {
            name: "11.5.1",
            value: "0.961429024",
            nonNormalValue: "5,778",
          },
          {
            name: "11.5.2",
            value: "0",
            nonNormalValue: "$1,707,159,182",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.192",
            nonNormalValue: "5.2",
          },
          {
            name: "11.7.1",
            value: "0.483131323",
            nonNormalValue: "35.0%",
          },
          {
            name: "11.7.2",
            value: "0.566564605",
            nonNormalValue: "70.78",
          },
        ],
      },
      {
        name: "Edmonton",
        data: [
          {
            name: "11.1.1",
            value: "0.356020942",
            nonNormalValue: "12.3%",
          },
          {
            name: "11.2.1",
            value: "0.568578554",
            nonNormalValue: "82.7%",
          },
          {
            name: "11.3.1",
            value: "0.842841747",
            nonNormalValue: "1.5",
          },
          {
            name: "11.3.2",
            value: "0.416666667",
            nonNormalValue: "3.25 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.64384356",
            nonNormalValue: "$1,284",
          },
          {
            name: "11.5.1",
            value: "0.999015336",
            nonNormalValue: "148",
          },
          {
            name: "11.5.2",
            value: "0.994536848",
            nonNormalValue: "$9,326,471",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.144",
            nonNormalValue: "6.4",
          },
          {
            name: "11.7.1",
            value: "0.3266746",
            nonNormalValue: "30.3%",
          },
          {
            name: "11.7.2",
            value: "0.475995101",
            nonNormalValue: "85.57",
          },
        ],
      },
      {
        name: "Vancouver",
        data: [
          {
            name: "11.1.1",
            value: "0.078534031",
            nonNormalValue: "17.6%",
          },
          {
            name: "11.2.1",
            value: "0.817955112",
            nonNormalValue: "92.7%",
          },
          {
            name: "11.3.1",
            value: "1.023418723",
            nonNormalValue: "0.9",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.405696012",
            nonNormalValue: "$1,139",
          },
          {
            name: "11.5.1",
            value: "0.630853372",
            nonNormalValue: "55,298",
          },
          {
            name: "11.5.2",
            value: "0.800183756",
            nonNormalValue: "$341,118,136",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.22",
            nonNormalValue: "4.5",
          },
          {
            name: "11.7.1",
            value: "0.330980265",
            nonNormalValue: "30.4%",
          },
          {
            name: "11.7.2",
            value: "0.679853031",
            nonNormalValue: "52.28",
          },
        ],
      },
      {
        name: "Victoria",
        data: [
          {
            name: "11.1.1",
            value: "0.256544503",
            nonNormalValue: "14.2%",
          },
          {
            name: "11.2.1",
            value: "0.760598504",
            nonNormalValue: "90.4%",
          },
          {
            name: "11.3.1",
            value: "0.929264945",
            nonNormalValue: "1.2",
          },
          {
            name: "11.3.2",
            value: "0.666666667",
            nonNormalValue: "4 out of 5",
          },
          {
            name: "11.4.1",
            value: "0.415613018",
            nonNormalValue: "$1,145",
          },
          {
            name: "11.5.1",
            value: "0.851679244",
            nonNormalValue: "22,219",
          },
          {
            name: "11.5.2",
            value: "0.984893508",
            nonNormalValue: "$25,789,187",
          },
          {
            name: "11.6.1",
            value: "1",
            nonNormalValue: "100%",
          },
          {
            name: "11.6.2",
            value: "1.228",
            nonNormalValue: "4.3",
          },
          {
            name: "11.7.1",
            value: "0.041723805",
            nonNormalValue: "22.0%",
          },
          {
            name: "11.7.2",
            value: "0.563563993",
            nonNormalValue: "71.27",
          },
        ],
      },
    ];

    // add descriptions to city traits
    countryData.forEach((city) => {
      city.data.reverse();
      addDescriptionsToCityTraits(city);
    });
    function addDescriptionsToCityTraits(city: DataModel) {
      city.data.forEach((trait) => addDescriptionToTrait(trait));
    }
    function addDescriptionToTrait(trait: DataPoint) {
      switch (trait.name) {
        case "11.6.2":
          trait.description =
            "Average fine particule matter concentrations (PM 2.5)";
          break;
        case "11.3.1":
          trait.description =
            "Ratio of land consumption rate to population growth rate (1971 to 2011)";
          break;
        case "11.7.2":
          trait.description = "Sexual assault (rate per 100,000 population)";
          break;
        case "11.1.1":
          trait.description = "Proportion of households in core housing need";
          break;
        case "11.7.1":
          trait.description = "Average share of the built-up area of cities that is open space for public use for all, by sex, age and persons with disabilities";
            break;
        case "11.5.1":
          trait.description =
            "Number of people who died, went missing or were directly affected by disasters per 100,000 population";
          break;
        case "11.4.1":
          trait.description = "Total per capita expenditure on the preservation, protection and conservation of all cultural and natural heritage, by source of funding (public, private), type of heritage (cultural, natural) and level of government (national, regional, and local/municipal)";
          break;
        case "11.5.2":
          trait.description =
            "Direct economic loss: the monetary value of total or partial destruction of physical assets existing in the affected area. Direct economic loss is nearly equivalent to physical damage (based on the Inflation Calculator)";
          break;
        case "11.2.1":
          trait.description =
            "Percentage of population less than 500 metres from public transit access point";
          break;
        case "11.3.2":
          trait.description = "Score of direct and regular participation by civil society in the urban planning and management of the primate city.";
          break;
        case "11.6.1":
          trait.description =
            "Proportion of urban solid waste regularly collected and with adequate final discharge out of total urban solid waste generated by cities";
          break;
      }
    }
    return countryData;
  }
}
