
// Parameters for the sheet and the API...
const __ROW = 2;
const __COL = 1;
const __CHANNELCOL = 8;
const __STATSCOL = __CHANNELCOL + 9;  // See makeResult() and adapt!
const __MAX = 50;  // 0..50, default: 5

// Parameters for YTsearch...
const __QUERY = "lovebites";
const __PART = "id, snippet";
const __STATPART = "statistics, contentDetails, topicDetails, status, liveStreamingDetails";
const __CHANPART = "statistics";  // 'statistics, brandingSettings, localizations'
const __ORDER = 'date';  // default: 'relevance'
const __TYPE = 'video';  // default: 'video,channel,playlist'

// Parameter for YTdetails...
const __STATSPART = __PART + ", " + __STATPART;
const __CHANNELPART = __PART + ", " + __CHANPART;

function runYTall() {
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeID(info[0], info[1], info[2])).join(',');
  const __CHANNELIDS = __INFO.map(info => info[__CHANNELCOL - 1]).join(',');
  const __STATS = getStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

function runYTsearch() {
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeID(info[0], info[1], info[2])).join(',');
  const __STATS = getStats(__IDS);

  return setYTsearchData(__ROW, __COL, __INFO, __STATS);
}

function runYTdetails() {
  const __ACTIVESHEET = getActiveSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __COL, __MAX, 1).getValues();
  const __IDS = __IDCOL.join(',');
  const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, 1).getValues();
  const __CHANNELIDS = __CHANNELIDCOL.join(',');  // Empty entries!
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

function setYTsearchData(row, col, info, stats) {
  const __ACTIVESHEET = getActiveSheet();
  const __INFOLEN = ((info && info.length) ? info.length : 0);
  const __STATLEN = ((stats && stats.length) ? stats.length : 0);
  const __INFOWIDTH = ((info && info[0] && info[0].length) ? info[0].length : 0);
  const __STATWIDTH = ((stats && stats[0] && stats[0].length) ? stats[0].length : 0);
  const __INFOCOL = col;
  const __STATCOL = __INFOCOL + __INFOWIDTH;

  __ACTIVESHEET.getRange(row, __INFOCOL, __INFOLEN, __INFOWIDTH).setValues(info);
  __ACTIVESHEET.getRange(row, __STATCOL, __STATLEN, __STATWIDTH).setValues(stats);

  return true;
}

function setYTdetailsData(row, col, statsCol, info, stats, channelStats) {
//  Logger.log(info); Logger.log(stats); Logger.log(channelStats);
  const __ACTIVESHEET = getActiveSheet();
  const __INFOLEN = ((info && info.length) ? info.length : 0);
  const __STATLEN = ((stats && stats.length) ? stats.length : 0);
  const __CHANLEN = ((channelStats && channelStats.length) ? channelStats.length : 0);
  const __INFOWIDTH = ((info && info[0] && info[0].length) ? info[0].length : 0);
  const __STATWIDTH = ((stats && stats[0] && stats[0].length) ? stats[0].length : 0);
  const __CHANWIDTH = ((channelStats && channelStats[0] && channelStats[0].length) ? channelStats[0].length : 0);
  const __INFOCOL = col;
  const __STATCOL = statsCol;
  const __CHANCOL = __STATCOL + __STATWIDTH;

  if (__INFOLEN) { __ACTIVESHEET.getRange(row, __INFOCOL, __INFOLEN, __INFOWIDTH).setValues(info) };
  if (__STATLEN) { __ACTIVESHEET.getRange(row, __STATCOL, __STATLEN, __STATWIDTH).setValues(stats) };
  if (__CHANLEN) { __ACTIVESHEET.getRange(row, __CHANCOL, __CHANLEN, __CHANWIDTH).setValues(channelStats) };

  return true;
}

function getSearchInfo(query, max, order, type) {
  const __SELECT = __PART;
  const __EXTRACT = __SELECT;
  const __LIST = YouTube.Search.list(__SELECT,
                    { q: query, maxResults: max, order: order, type: type, safeSearch: 'none' });
  const __RET = __LIST.items.map(item => mapResult(item, __EXTRACT));

  return __RET;
}

function getStats(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __STATS = __LIST.items.map(item => mapResult(item, __EXTRACT));

  return __STATS;
}

function getInfoStats(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __EXTRACTINFO = __PART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __INFO = __LIST.items.map(item => mapResult(item, __EXTRACTINFO));
  const __STATS = __LIST.items.map(item => mapResult(item, __EXTRACT));

  return [ __INFO, __STATS ];
}

function getChannelStats(part, channelIDs, max) {
  const __SELECT = part;
  const __EXTRACT = __SELECT;
  const __LIST = YouTube.Channels.list(__SELECT, { id: channelIDs, maxResults: max });
  const __CHANNELSTATS = __LIST.items.map(item => mapChannelResult(item, __EXTRACT));
  const __CHANNELMAP = { };
  let channelStats = [];

  __CHANNELSTATS.map(item => (__CHANNELMAP[item[0]] = item));

  for (channelID of channelIDs.split(',')) {
    if (channelID) {
      const __ENTRY = __CHANNELMAP[channelID];

      channelStats = channelStats.concat([ __ENTRY ]);
    }
  }

  return channelStats;
}

function mapResult(item, part) {
  const __PARTS = part.split(',').map(part => part.trim());
  const __ID = (((typeof item.id) === 'string') ? { videoId : item.id, kind: item.kind } : item.id);
  const __SN = item.snippet;
  const __CD = item.contentDetails;
  const __TD = item.topicDetails;
  const __TC = (__TD && __TD.topicCategories);
  const __SI = item.statistics;
  const __SU = item.status;
  const __LS = item.liveStreamingDetails;
  let data = [];

  for (part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __ID.videoId, __ID.channelId, __ID.playlistId, __ID.kind ]);
                          break;
      case 'snippet':     data = data.concat([ __SN.title, __SN.description,
                                                isoTime2de(__SN.publishedAt),
                                                __SN.channelId, __SN.channelTitle,
                                                __SN.liveBroadcastContent,  // 'upcoming', 'live', 'none'
                                                __SN.categoryId, __SN.defaultAudioLanguage,
                                                isoTime2unix(__SN.publishedAt), isoTime2rel(__SN.publishedAt) ]);
                          break;
      case 'contentDetails': data = data.concat([ __CD.definition, __CD.caption, __CD.projection,
                                                  __CD.licensedContent, __CD.dimension,
                                                  __CD.duration, PT2time(__CD.duration) ]);
                          break;
      case 'topicDetails': data = data.concat([ (__TC && __TC.join(" ")) ]);
                          break;
      case 'statistics':  data = data.concat([ __SI.viewCount, __SI.likeCount, __SI.commentCount ]);
                          break;
      case 'status':      data = data.concat([ __SU.license, __SU.embeddable, __SU.publicStatsViewable,
                                                __SU.madeForKids, __SU.privacyStatus, __SU.uploadStatus ]);
                          break;
      case 'liveStreamingDetails':
                          data = data.concat([ (__LS && isoTime2de(__LS.scheduledStartTime)),
                                                (__LS && isoTime2unix(__LS.scheduledStartTime)),
                                                (__LS && isoTime2rel(__LS.scheduledStartTime)),
                                                (__LS && __LS.activeLiveChatId) ]);

                          // Paste string for Discord...
                          const __PREMIERE = ((__SN.liveBroadcastContent === 'none') ? '' : "Premiere ")
                                              + ((__SN.liveBroadcastContent === 'live') ? "NOW " : '') + '('; 
                          const __DISCORD = ((__SN.liveBroadcastContent == 'none') ? '[' + (__SN && isoTime2rel(__SN.publishedAt)) + "] "
                                                                      : __PREMIERE + (__LS && isoTime2rel(__LS.scheduledStartTime)) + ") ")
                                              + "https://youtu.be/" + __ID.videoId;

                          data = data.concat([ __DISCORD ]);
                          break;
      default:            break;
    }
  }

  data = data.concat([ item.toString() ]);  // for debugging purposes

  return data;
}

function mapChannelResult(item, part) {
  const __PARTS = part.split(',').map(part => part.trim());
  const __ID = item.id;
  const __KIND = item.kind;
  const __SN = item.snippet;
  const __SI = item.statistics;
  const __BS = item.brandingSettings;
  let data = [];

  for (part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __ID, __KIND ]);
                          break;
      case 'snippet':     data = data.concat([ __SN.customUrl, __SN.title, __SN.description,
                                                isoTime2de(__SN.publishedAt), isoTime2unix(__SN.publishedAt),
                                                isoTime2rel(__SN.publishedAt), __SN.country ]);
                          break;
      case 'statistics':  data = data.concat([ __SI.viewCount, __SI.subscriberCount, __SI.videoCount ]);
                          break;
      case 'brandingSettings': const __CH = ((item.brandingSettings) ? item.brandingSettings.channel : null);
                          data = data.concat([ __CH.title, __CH.description ]);
                          break;
      default:            break;
    }
  }

  data = data.concat([ item.toString() ]);  // for debugging purposes

  return data;
}

function safeID(video, channel, playlist) {
  if (video) return video;
  if (channel) return channel;
  if (playlist) return playlist;

  return 'jNQXAC9IVRw';  // ZOO Video
}

function getActiveSheet() {
  const __SHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __ACTIVESHEET = __SHEET.getActiveSheet();

  return __ACTIVESHEET;
}

function PT2time(duration, timeFormat = true) {
  const __SECONDS = { 'S': 1, 'M': 60, 'H': 3600, 'D': 86400 };  // More units needed?
  let secs = -1;

  if (duration && duration.startsWith('P')) {
    let s = duration.replace(/^P(.*)T(.*)/, '$1$2');

    while (s) {
      const __VAL = Number.parseInt(s, 10);
      const __POS = __VAL.toFixed(0).length;
      const __UNIT = s[__POS];
      const __SECS = __SECONDS[__UNIT];

      secs += __VAL * __SECS;
      s = s.substring(__POS + 1);
    }
  }

  if (timeFormat) {
    const __DATE = new Date(secs * 1000);
    const __TIME = Utilities.formatDate(__DATE, 'UTC', 'HH:mm:ss');
  
    s = __TIME;
  } else {
    s = secs;
  }

  return ((secs < 0) ? duration : s);
}

function isoTime2unix(isoTime) {
  const __DATE = new Date(isoTime);

  return Number((__DATE / 1000).toFixed(0));  // Convert ms to s
}

function isoTime2discord(isoTime, flag = 'R') {
  const __TIMESTAMP = isoTime2unix(isoTime);
  const __DISCORD = '<t:' + __TIMESTAMP + ':' + flag.toUpperCase() + '>';

  return __DISCORD;
}

function isoTime2rel(isoTime) {
  return isoTime2discord(isoTime, 'R');
}

function isoTime2de(isoTime) {
  const __DATE = new Date(isoTime);
  const __LOCAL = __DATE.toLocaleString('de-DE', { timeZone: 'CET' });

  return __LOCAL;  // .replace(',', '');
}

function testMap() {
  const __ITEM = { id: { videoId: 'cEAmmT-T0Fg', kind: 'youtube#video' },
                    snippet: { publishedAt: '2025-01-23T16:17:20Z',
                      description: 'This is a reaction to the song "we are the Resurrection" performed by LOVEBITES live from Memorial for the Warrior\'s Soul.',
                      channelId: 'UCMRBbkpiK8JnDg9kTQdYPtA', channelTitle: 'vintage_sol',
                      title: 'LOVEBITES-We are the Resurrection OLV(1st time reaction)',
                      publishTime: '2025-01-23T16:17:20Z',
                      tags: [ 'Lovebites', 'Lovebites reaction video', 'Soldier Stands Solitarily Lovebites', 'Soldier Stands Solitarily song', 'reaction videos' ], defaultAudioLanguage: 'en-US', categoryId: '19', liveBroadcastContent: 'none' }, contentDetails: { licensedContent: false, contentRating: { },definition: 'hd', dimension: '2d', projection: 'rectangular', caption: 'false', duration: 'PT10M50S' }, topicDetails: { topicCategories: [ 'https://en.wikipedia.org/wiki/Music', 'https://en.wikipedia.org/wiki/Rock_music' ] }, status: { privacyStatus: 'public', publicStatsViewable: true, uploadStatus: 'processed', madeForKids: false, license: 'youtube', embeddable: true }, statistics: { viewCount: '500', likeCount: '130', commentCount: '19', favoriteCount: '0' }, liveStreamingDetails: { actualEndTime: '2025-01-24T22:12:07Z', actualStartTime: '2025-01-24T22:00:09Z', scheduledStartTime: '2025-01-24T22:00:00Z', activeLiveChatId: '[...]' } };  // Mixed a real life entry with a premiere schedule (no chat)
  const __RET = mapResult(__ITEM, __STATSPART);

  Logger.log(__RET);
}

function testIsoTime() {
  const __TIME = '2025-01-23T16:17:20Z';
  const __NOW = new Date();
  const __TIMEUNIX = isoTime2unix(__TIME);
  const __NOWUNIX = isoTime2unix(__NOW);
  const __TIMEDE = isoTime2de(__TIME);
  const __NOWDE = isoTime2de(__NOW);
  const __TIMEREL = isoTime2rel(__TIME);
  const __NOWREL = isoTime2rel(__NOW);

  Logger.log({ time: __TIMEUNIX });
  Logger.log({ now: __NOWUNIX });

  Logger.log({ time_de: __TIMEDE });
  Logger.log({ now_de: __NOWDE });

  Logger.log({ time_rel: __TIMEREL });
  Logger.log({ now_rel: __NOWREL });
}

function testPT2time() {

  const __PTs = [ 'PT1M29S', 'PT15M8S', 'PT9M8S', 'PT31M20S', 'PT11M55S', 'PT5M49S', 'PT25S', 'PT7M21S', 'PT6M25S',
                  'PT7M52S', 'PT21S', 'PT10M42S', 'PT6M7S', 'PT23S', 'PT7M48S', 'PT13S', 'PT11S', 'PT15M8S', 'PT3M29S', 'PT11M59S', 'PT11S', 'PT19M24S', 'PT15S', 'PT17M48S', 'PT12M58S', 'PT11M59S', 'PT8M46S', 'PT9M23S', 'PT14S', 'PT25S', 'PT6S', 'PT2H12M22S', 'PT1M', 'PT7M21S', 'PT5M33S', 'PT6M6S', 'PT19S', 'PT19S', 'PT13M5S', 'PT20S', 'PT24M30S', 'PT9M50S', 'PT17S', 'PT20M34S', 'PT12S', 'PT15S', 'PT11M27S', 'PT38S', 'PT35S',  // 50 real life 'duration' values
                  '', null, 'null', 'P12DT4H36M54S' ];  // ... and some missing ones and a longer one from scratch

  for (duration of __PTs)  {
    const __TIME = PT2time(duration);

    Logger.log(duration + " -> " + __TIME);
  }
}
