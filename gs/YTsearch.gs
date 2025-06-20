
// Parameters for the sheet and the API...
  const __ROW = 2;
  const __COL = 1;
  const __CHANNELCOL = 8;
  const __STATSCOL = __CHANNELCOL + 2;
  const __MAX = 50;  // 0..50, default: 5

// Parameters for YTsearch...
  const __QUERY = "lovebites";
  const __PART = "id, snippet";
  const __STATPART = "statistics";
  const __ORDER = 'date';  // default: 'relevance'
  const __TYPE = 'video';  // default: 'video,channel,playlist'

// Parameter for YTdetails...
  const __STATSPART = "id, snippet, statistics";
  // 'id, snippet, statistics, brandingSettings, localizations'
  const __CHANNELPART = 'id, snippet, statistics';

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
  const __CHANNELIDS = __CHANNELIDCOL.join(',');
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
  const __LIST = YouTube.Search.list(__SELECT,
                    { q: query, maxResults: max, order: order, type: type, safeSearch: 'none' });
  const __RET = __LIST.items.map(item => mapResult(item, __SELECT));

  return __RET;
}

function getStats(IDs) {
  const __SELECT = __STATPART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __STATS = __LIST.items.map(item => mapResult(item, __SELECT));

  return __STATS;
}

function getInfoStats(IDs) {
  const __SELECT = __STATSPART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __INFO = __LIST.items.map(item => mapResult(item, __PART));
  const __STATS = __LIST.items.map(item => mapResult(item, __STATPART));

  return [ __INFO, __STATS ];
}

function getChannelStats(part, channelIDs, max) {
  const __LIST = YouTube.Channels.list(part, { id: channelIDs, maxResults: max });
  const __CHANNELSTATS = __LIST.items.map(item => mapChannelResult(item, part));
  const __CHANNELMAP = { };
  let channelStats = [];

  __CHANNELSTATS.map(item => (__CHANNELMAP[item[0]] = item));

  for (channelID of channelIDs.split(',')) {
    channelStats = channelStats.concat([ __CHANNELMAP[channelID] ]);
  }

  return channelStats;
}

function mapResult(item, part) {
  const __PARTS = part.split(',').map(part => part.trim());
  let data = [];

  for (part of __PARTS) {
      const __ID = (((typeof item.id) === 'string') ? { videoId : item.id, kind: item.kind } : item.id);
      const __SN = item.snippet;
      const __ST = item.statistics;
  
      switch (part) {
        case 'id':          data = data.concat([ __ID.videoId, __ID.channelId, __ID.playlistId, __ID.kind ]);
                            break;
        case 'snippet':     data = data.concat([ __SN.title, __SN.description, __SN.publishedAt,
                                                  __SN.channelId, __SN.channelTitle ]);
                            break;
        case 'statistics':  data = data.concat([ __ST.viewCount, __ST.likeCount, __ST.commentCount ]);
                            break;
        default:            break;
      }
  }

  return data;
}

function mapChannelResult(item, part) {
  const __PARTS = part.split(',').map(part => part.trim());
  let data = [];

  for (part of __PARTS) {
      const __ID = item.id;
      const __KIND = item.kind;
      const __SN = item.snippet;
      const __ST = item.statistics;
      const __BS = item.brandingSettings;
  
      switch (part) {
        case 'id':          data = data.concat([ __ID, __KIND ]);
                            break;
        case 'snippet':     data = data.concat([ __SN.title, __SN.description, __SN.publishedAt, __SN.country ]);
                            break;
        case 'statistics':  data = data.concat([ __ST.viewCount, __ST.subscriberCount, __ST.videoCount ]);
                            break;
        case 'brandingSettings': const __CH = ((item.brandingSettings) ? item.brandingSettings.channel : null);
                            data = data.concat([ __CH.title, __CH.description ]);
                            break;
        default:            break;
      }
  }

  return data;
}

function testMap() {
  const __ITEM = { id: { videoId: 'cEAmmT-T0Fg', kind: 'youtube#video' },
                    snippet: { publishedAt: '2025-01-23T16:17:20Z',
                      description: 'This is a reaction to the song "we are the Resurrection" performed by LOVEBITES live from Memorial for the Warrior\'s Soul.',
                      channelId: 'UCMRBbkpiK8JnDg9kTQdYPtA', channelTitle: 'vintage_sol',
                      title: 'LOVEBITES-We are the Resurrection OLV(1st time reaction)',
                      publishTime: '2025-01-23T16:17:20Z' } };
  const __RET = mapResult(__ITEM, __PART);

  Logger.log(__RET);
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
