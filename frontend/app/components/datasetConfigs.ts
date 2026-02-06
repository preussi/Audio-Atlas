export interface DatasetConfig {
  nameField: string;
  pointSize: number;
  searchZoomLevel: number;
  isOnline: boolean;
  encoding: {
    color: {
      field: string;
      domain?: string[];
      range: string[] | string;
    };
  };
}

export const DATASET_CONFIGS: Record<string, DatasetConfig> = {
  fma: {
    nameField: 'track_title',
    pointSize: 3,
    searchZoomLevel: 100,
    isOnline: false,
    encoding: {
      color: {
        field: 'class',
        domain: ['Rock', 'Metal', 'Pop', 'Disco', 'HipHop', 'Jazz', 'Blues', 'Reggae', 'Country', 'Classical', 'Electronic', 'Folk', 'Reggaeton', 'Dubstep', 'Soul', 'World', 'Noise'],
        range: ['red', 'blue', 'green', 'yellow', 'purple', 'aqua', 'brown', 'crimson', 'pink', 'orange', 'lime', 'teal', 'beige', 'lightgreen', 'lightyellow', 'magenta', 'lightcyan'],
      },
    },
  },
  disco: {
    nameField: 'video_title_youtube',
    pointSize: 1.3,
    searchZoomLevel: 150,
    isOnline: true,
    encoding: {
      color: {
        field: 'class',
        range: 'category10',
      },
    },
  },
  jamendo: {
    nameField: 'TRACK_NAME',
    pointSize: 3,
    searchZoomLevel: 100,
    isOnline: false,
    encoding: {
      color: {
        field: 'class',
        domain: ['Rock', 'Metal', 'Pop', 'Disco', 'HipHop', 'Jazz', 'Blues', 'Reggae', 'Country', 'Classical', 'Electronic', 'Folk', 'Reggaeton', 'Dubstep', 'Soul', 'World', 'Noise'],
        range: ['red', 'blue', 'green', 'yellow', 'purple', 'aqua', 'brown', 'crimson', 'pink', 'orange', 'lime', 'teal', 'beige', 'lightgreen', 'lightyellow', 'magenta', 'lightcyan'],
      },
    },
  },
  musiccaps: {
    nameField: 'Description',
    pointSize: 4,
    searchZoomLevel: 100,
    isOnline: true,
    encoding: {
      color: {
        field: 'class',
        domain: ['Rock', 'Metal', 'Pop', 'Disco', 'HipHop', 'Jazz', 'Blues', 'Reggae', 'Country', 'Classical'],
        range: ['red', 'blue', 'green', 'yellow', 'purple', 'aqua', 'brown', 'cyan', 'pink', 'orange'],
      },
    },
  },
  vctk: {
    nameField: 'text',
    pointSize: 3,
    searchZoomLevel: 40,
    isOnline: false,
    encoding: {
      color: {
        field: 'class',
        domain: ['Male', 'Female'],
        range: ['red', 'blue'],
      },
    },
  },
  ESC50: {
    nameField: 'filename',
    pointSize: 3,
    searchZoomLevel: 100,
    isOnline: false,
    encoding: {
      color: {
        field: 'class',
        domain: [
          'Dog', 'Rain', 'Crying baby', 'Door knock', 'Door, wood creaks',
          'Helicopter', 'Train', 'Rooster', 'Sea waves', 'Sneezing',
          'Mouse click', 'Chainsaw', 'Pig', 'Crackling fire', 'Clapping',
          'Keyboard typing', 'Siren', 'Cow', 'Crickets', 'Breathing',
          'Car horn', 'Frog', 'Chirping birds', 'Coughing', 'Can opening',
          'Engine', 'Cat', 'Water drops', 'Footsteps', 'Washing machine',
          'Hen', 'Wind', 'Laughing', 'Vacuum cleaner', 'Church bells',
          'Insects (flying)', 'Pouring water', 'Brushing teeth', 'Clock alarm',
          'Airplane', 'Sheep', 'Toilet flush', 'Snoring', 'Clock tick',
          'Fireworks', 'Crow', 'Thunderstorm', 'Drinking, sipping',
          'Glass breaking', 'Hand saw',
        ],
        range: [
          '#B76E79', '#7FB7BE', '#F4CCCC', '#D9EAD3', '#B9EAD3',
          '#999999', '#999966', '#E06666', '#6FA8DC', '#FFE599',
          '#CCCCCC', '#6AA84F', '#F4CCCC', '#CC0000', '#FFE599',
          '#B7B7B7', '#FF0000', '#A4C2F4', '#93C47D', '#D9D2E9',
          '#FF9900', '#93C47D', '#B6D7A8', '#E6B8AF', '#CCCCCC',
          '#666666', '#EAD1DC', '#A2C4C9', '#D9D9D9', '#A4C2F4',
          '#F9CB9C', '#A4C2F4', '#FFFF99', '#999999', '#D5A6BD',
          '#B6D7A8', '#A2C4C9', '#D9EAD3', '#F6B26B', '#999999',
          '#CFE2F3', '#A4C2F4', '#D9D2E9', '#CCCCCC', '#A4C2F4',
          '#666666', '#434343', '#D9EAD3', '#E06666', '#A4C2F4',
        ],
      },
    },
  },
  yt8m: {
    nameField: 'text',
    pointSize: 4,
    searchZoomLevel: 50,
    isOnline: true,
    encoding: {
      color: {
        field: 'class',
        domain: ['Rock', 'Metal', 'Pop', 'Disco', 'HipHop', 'Classical', 'Jazz', 'Blues', 'Reggae', 'Country'],
        range: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'Chartreuse', 'brown', 'cyan', 'pink'],
      },
    },
  },
};

export const COMMON_PREFS = {
  max_points: 1000000,
  alpha: 30,
  zoom_balance: 0.5,
  background_color: 'black',
  duration: 500,
};
