// Example URL of the API endpoint
const DATA_API_URL = 'http://ee-tik-vm054.ethz.ch:8000/graph-data';

// Function to fetch data based on the domain
async function fetchData(domain) {
  const { x, y } = domain;

  // Construct the URL with query parameters for the domain
  const url = new URL(DATA_API_URL);
  url.searchParams.append('xmin', x[0]);
  url.searchParams.append('xmax', x[1]);
  url.searchParams.append('ymin', y[0]);
  url.searchParams.append('ymax', y[1]);

  try {
    // Fetch the data from the API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Return an empty array in case of error
  }
}

export default fetchData;
