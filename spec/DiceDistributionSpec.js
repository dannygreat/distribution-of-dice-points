const axios = require('axios');

describe('Distribution of dice points strives to uniform distribution', function () {
  const axiosBatchSize = 10;

  [1, 2].forEach(numDices => {
    const a = 1 * numDices;
    const b = 6 * numDices;
    const expectedMean = (a + b) / 2;
    const expectedSigma = Math.sqrt((Math.pow(b - a + 1, 2) - 1) / 12); //standard deviation for discrete uniform distribution

    //Max 1,000 requests per day - https://api.random.org/pricing
    [50, 150].forEach(iterations => {
      it(`${numDices} dice(s) points deviation on ${iterations} iterations`, async function () {
        const dices = [];

        let axiosArray = [];
        for (let iteration = 0; iteration < iterations; iteration++) {
          const promise = axios.get('https://random.org/integers/', {
            params: { num: 10, min: 1, max: 6, col: 2, base: 10, format: 'plain', rnd: 'new' }
          });
          axiosArray.push(promise);

          if (iteration % axiosBatchSize == 0 || iteration == iterations - 1) { //Call random.org in parallel in batches
            console.log(`${iteration}/${iterations}`);
            await axios.all(axiosArray)
              .then(axios.spread((...responses) => {
                responses.forEach(response => {
                  const twoDices = response.data.split('\n')[0].split('\t');
                  let dicesSum = 0;
                  for (let i = 0; i < numDices; i++) {
                    dicesSum += parseInt(twoDices[i]);
                  }
                  dices.push(dicesSum);
                });
              }));
            axiosArray = [];
          }
        }

        console.log('Dices:', dices.length);

        const n = iterations;

        let mean = 0;
        for (const x of dices) {
          mean += x;
        }
        mean = mean / n;

        let sigma = 0; //actual standard deviation
        for (const x of dices) {
          sigma += Math.pow(x - mean, 2);
        }
        sigma = Math.sqrt(sigma / n);

        console.log(mean, expectedMean);
        console.log(sigma, expectedSigma);

        const meanPercent = Math.abs(mean - expectedMean) / expectedMean;
        const sigmaPercent = Math.abs(sigma - expectedSigma) / expectedSigma;

        console.log(meanPercent, sigmaPercent);

        // expect(meanPercent).toBeLessThan(0.05);
        expect(sigmaPercent).toBeLessThan(0.05); //0.05
      });
    });
  });
});
