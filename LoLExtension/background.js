const API_URL = 'https://leaguewatcher.onrender.com/schedule';

const LEAGUE_MAP = {
  'EMEA Masters': 'https://lolesports.com/live/emea_masters/emeamasters',
  'MSI' : 'https://lolesports.com/live/msi',
  'LCS': 'https://lolesports.com/live/lcs',
  'LCS Challengers': 'https://lolesports.com/live/north_american_challenger_league',
  'LCS Challengers Qualifiers': 'https://lolesports.com/live/lcs_challengers_qualifiers',
  'College Championship': '',
  'CBLOL': 'https://lolesports.com/live/cblol',
  'LCK': 'https://lolesports.com/live/lck',
  'LCL': 'https://lolesports.com/live/lcl',
  'LCO': 'https://lolesports.com/live/lco',
  'LEC': 'https://lolesports.com/live/lec',
  'LJL': 'https://lolesports.com/live/ljl-japan/ljl',
  'LLA': 'https://lolesports.com/live/lla',
  'LPL': 'https://lolesports.com/live/lpl',
  'PCS': 'https://lolesports.com/live/pcs/lolpacific',
  'TCL': '',
  'VCS': '',
  'Worlds': 'https://lolesports.com/live/worlds',
  'All-Star Event': '',
  'La Ligue Française': '',
  'NLC': '',
  'Elite Series': '',
  'Liga Portuguesa': '',
  'PG Nationals': '',
  'Ultraliga': '',
  'SuperLiga': '',
  'Prime League': '',
  'Hitpoint Masters': '',
  'Esports Balkan League': '',
  'Greek Legends League': '',
  'Arabian League': 'https://lolesports.com/live/arabian_league',
  'LCK Academy': '',
  'LJL Academy': 'https://lolesports.com/live/ljl_academy',
  'LCK Challengers': 'https://lolesports.com/live/lck_challengers_league',
  'CBLOL Academy': 'https://lolesports.com/live/cblol_academy',
  'Liga Master': '',
  'Golden League': '',
  'Elements League': '',
  'Stars League': '',
  'Honor Division': '',
  'Volcano League': '',
  'Honor League': '',
  'TFT Rising Legends': 'https://lolesports.com/live/tft_esports/teamfighttactics',
  'TAL': '',
  'Master Flow League': ''
}

async function fetchSchedule() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    checkSchedule(data);
  } catch (error) {
    console.error(error);
  }
}


let matchWindowMap = new Map();

async function checkSchedule(data) {
  if (!data?.data?.schedule?.events) {
    console.error('Schedule data is invalid:', data);
    return;
  }

  console.log('Checking schedule...');
  const events = data.data.schedule.events;
  const now = new Date();

  for (const event of events) {
    const matchLeagueURL = LEAGUE_MAP[event.league.name];
    const timeUntilMatch = new Date(event.startTime) - now;
    const leagueName = event.league.name;
    if (event?.state === 'unstarted' || event?.state === 'inProgress' && event.type === 'match') {
      if (timeUntilMatch <= 600 * 1000) {
        if (getByValue(matchWindowMap, event?.match?.id)) {
          console.log(`Match ${leagueName} has already been opened`);
        } else {
          chrome.windows.create({ url: matchLeagueURL, state: "maximized"}, function(windows) {
            matchWindowMap.set(windows.id, event?.match?.id);
          });
        }
      }
    } else if (event?.match?.state === 'completed' && getByValue(matchWindowMap, event?.match?.id)) {
      console.log(`Match ${event.league.name} has completed.`);
      const windowID = getByValue(matchWindowMap, event?.match?.id);
      chrome.windows.remove(windowID);
      console.log(`Closed window ${windowID}`);
      matchWindowMap.delete(windowID);
      }
    }
  }

chrome.windows.onRemoved.addListener((windowId) => {
  if (matchWindowMap.has(windowId)) {
    console.log(`Window ${windowId} was closed by the user`);
    matchWindowMap.delete(windowId);
  }
});


function getByValue(map, target) {
  for (let [key, value] of map.entries()) {
    if (value === target)
      return key;
  }
}

chrome.runtime.onInstalled.addListener(function() {
  fetchSchedule();
});


setInterval(fetchSchedule, 300 * 1000);
