
// Parameters for the sheet and the API...
const __ROW = 2;
const __COL = 1;
const __PASTESHEETNAME = 'Paste';
const __VIDCOL = __COL;
const __CHANNELCOL = 8;
const __STATSCOL = __CHANNELCOL + 9;  // 'Q' See makeResult() and adapt to correct value!
const __CHANNELSCOL = __STATSCOL + 24;  // 'AO' See makeResult() and adapt to correct value!
const __HANDLECOL = __CHANNELSCOL + 2;  // 'AQ' See makeChannelResult() and adapt to correct value!
const __MAX = 50;  // Number of rows to be filled (0..50, default: 5), starting at row 2
const __SHOWITEM = false;  // Do we need the raw package?
const __SHORTDESC = true;  // Cut description fields in order to not break the layout?
const __DESCLEN = (__SHORTDESC ? 50 : -1);  // Max length of description (only "snippet" for videos and channels)
const __SHOWDESC = true;  // Do we need the description at all?
const __SHOWPASTE = true;

// Parameters for YTsearch...
const __QUERY = "lovebites";  // Put search query here!
const __PART = "id, snippet";
const __STATPART = "statistics, contentDetails, topicDetails, status, liveStreamingDetails";
const __CHANPART = "statistics";  // 'statistics, brandingSettings, localizations'
const __ORDER = 'date';  // default: 'relevance'
const __TYPE = 'video';  // default: 'video,channel,playlist'

// Parameter for YTdetails...
const __STATSPART = __PART + ", " + __STATPART;
const __CHANNELPART = __PART + ", " + __CHANPART;

// Main: Search and get STATS and CHANNELS...
function runYTall() {
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeID(info[0], info[1], info[2])).join(',');
  const __CHANNELIDS = __INFO.map(info => info[__CHANNELCOL - 1]).join(',');
  const __STATS = getStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column (row 2..51) and get STATS and CHANNELS...
function runYTdetailsAll() {
  const __ACTIVESHEET = getPasteSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, 1).getValues();
  const __IDS = __IDCOL.join(',');
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELIDS = __INFO.map(info => info[__CHANNELCOL - 1]).join(',');
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column and ChannelIDs from eigths column (row 2..51)
// and get CHANNELS...
function runYTsearch() {
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeID(info[0], info[1], info[2])).join(',');
  const __STATS = getStats(__IDS);

  return setYTsearchData(__ROW, __COL, __INFO, __STATS);
}

// Main: Get IDs from first column and ChannelIDs from eigth column (row 2..51)
// and get STATS and CHANNELS...
function runYTdetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, 1).getValues();
  const __IDS = __IDCOL.join(',');
  const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, 1).getValues();
  const __CHANNELIDS = __CHANNELIDCOL.join(',');  // Empty entries!
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column and ChannelIDs from eigth column (row 2..51)
// and get STATS and CHANNELS...
function runYTdetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, 1).getValues();
  const __CHANNELIDS = __CHANNELIDCOL.join(',');  // Empty entries!
  const __INFO = [];
  const __STATS = [];
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column and ChannelIDs from 43th column (row 2..51)
// and get STATS and CHANNELS...
function runYThandleDetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __CELL = __ACTIVESHEET.getActiveCell();  // or getCurrentCell()?
  const __ROW = __CELL.getRow();
  const __MAX = 1;
  const __CHANNELHANDLECOL = __ACTIVESHEET.getRange(__ROW, __HANDLECOL, __MAX, 1).getValues();
  const __CHANNELHANDLE = __CHANNELHANDLECOL.join(',');  // Empty entries!
  const __INFO = [];
  const __STATS = [];
  const __CHANNELSTATS = getChannelStatsForHandle(__CHANNELPART, __CHANNELHANDLE, __MAX);

  return setYTdetailsData(__ROW, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Run runYTAll(), but only if you are active on the 'Paste' sheet!
function triggerYTall() {
  return (checkVidCol() && runYTall());
}

// Main: Run runYTdetailsAll(), but only if you are changing a videoID (column 'A')!
function triggerYTdetailsAll() {
  return (checkVidCol() && runYTdetailsAll());
}

// Main: Run runYTchannelDetails(), but only if you are changing a channelID (column 'H')!
function triggerYTchannelDetails() {
  return (checkChannelCol() && runYTdetails());
}

// Main: Run runYThandleDetails(), but only if you are changing a handle of a channel (column 'AQ')!
function triggerYThandleDetails() {
  return (checkHandleCol() && runYThandleDetails());
}

function setYTsearchData(row, col, info, stats) {
  const __ACTIVESHEET = getPasteSheet();
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
  const __ACTIVESHEET = getPasteSheet();
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
  const __RET = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return __RET;
}

function getStats(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __STATS = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return __STATS;
}

function getInfoStats(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __EXTRACTINFO = __PART;
  const __LIST = YouTube.Videos.list(__SELECT, { id: IDs });
  const __INFO = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACTINFO)) : []);
  const __STATS = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return [ __INFO, __STATS ];
}

function getChannelStats(parts, channelIDs, max) {
  const __PARAMS = { id: channelIDs, maxResults: max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsForHandle(parts, handle, max) {
  const __PARAMS = { forHandle: handle, maxResults: max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsForUsername(parts, username, max) {
  const __PARAMS = { forUsername: username, maxResults: max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsEx(parts, params) {  Logger.log({ id : params.id } ); Logger.log({ maxResults : params.maxResults } );
  const __SELECT = parts;
  const __PARAMS = params;
  const __EXTRACT = __SELECT;
  const __LIST = YouTube.Channels.list(__SELECT, __PARAMS);
  const __CHANNELSTATS = (__LIST.items ? __LIST.items.map(item => mapChannelResult(item, __EXTRACT)) : []);
  const __CHANNELMAP = { };
  let channelIDs = [];
  let channelStats = [];
  let count = 0;

  __CHANNELSTATS.map(function(item) {
                        const __CHANNELID = item[0];

                        channelIDs[count++] = __CHANNELID;
                        __CHANNELMAP[__CHANNELID] = item;
  
                        return item;
                      });  Logger.log(channelIDs.join(','));

  const __CHANNELIDS = (__PARAMS.id ? __PARAMS.id.split(',') : channelIDs);

  for (channelID of __CHANNELIDS) {
    if (channelID) {
      const __ENTRY = __CHANNELMAP[channelID];

      channelStats = channelStats.concat([ __ENTRY ]);
    }
  }

  return channelStats;
}

function mapResult(item, parts) {
  const __PARTS = (parts ? parts.split(',').map(part => part.trim()) : []);
  const __ID = (((typeof item.id) === 'string') ? { videoId : item.id, kind: item.kind } : item.id);
  const __SN = item.snippet;
  const __FULLDESC = (__SN && __SN.description);
  const __DESC = ((__SHORTDESC && __FULLDESC && (__FULLDESC.length >= __DESCLEN - 1))
                      ? __FULLDESC.substring(0, __DESCLEN) + "..." : __FULLDESC);
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
      case 'snippet':     data = data.concat([ __SN.title, (__SHOWDESC && __DESC),
                                                isoTime2de(__SN.publishedAt),
                                                __SN.channelId, __SN.channelTitle,
                                                __SN.liveBroadcastContent,  // 'upcoming', 'live', 'none'
                                                __SN.categoryId, __SN.defaultAudioLanguage,
                                                isoTime2unix(__SN.publishedAt), isoTime2rel(__SN.publishedAt),
                                                //isoTime2de(__SN.publishTime), isoTime2unix(__SN.publishTime),
                                                //isoTime2rel(__SN.publishTime),  // See __SN.publishedAt!
                                                (__SN.tags ? __SN.tags.join(", ") : '')
                                              ]);
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
                          const __EXPREMIERE = ((__LS && __LS.scheduledStartTime
                                                      && (__SN.liveBroadcastContent === 'none')) ? "Premiere " : '');
                                                // This was scheduled, but it's over now and live... === 'none'
                          const __MINS = (isoTime2unix(__LS && __LS.scheduledStartTime) - isoTime2unix()) / 60;
                          const __WHEN = ((__SN.liveBroadcastContent === 'upcoming')
                                                ? ((__MINS < 2) ? "NOW "
                                                : ((__MINS < 66) ? __MINS + " minutes "
                                                                  : (__MINS / 60).toFixed(1) + " hours "))
                                                : '');
                          const __DISCORD = ((__SN.liveBroadcastContent === 'none')
                                                ? '[' + __EXPREMIERE + (__SN && isoTime2rel(__SN.publishedAt)) + "] "
                                                : __PREMIERE + __WHEN
                                                      + (__LS && isoTime2rel(__LS.scheduledStartTime)) + "): ")
                                                      + "https://youtu.be/" + __ID.videoId
                                                      + (__EXPREMIERE.length ? " DONE" : '');
                          const __CC = ((__CD && (__CD.caption.toLowerCase() === 'true')) ? "CC " : '');
                          const __LANG = (__SN.defaultAudioLanguage ? __SN.defaultAudioLanguage + ' ' : '');
                          const __VLEN = PT2time(__CD.duration);
                          const __VLENDISP = (__VLEN ? (__VLEN.startsWith("00:")
                                                        ? __VLEN.substring(3) : __VLEN) + ' ' : 'live');
                          const __DISCORDINFO = "\n[" + __VLENDISP + __CC + __LANG
                                                      + __CD.definition + '(' + __CD.dimension + ")] "
                                                      + __SN.channelTitle + '\n' + __SN.title;
                          const __DISCORDFULL = __DISCORD + __DISCORDINFO;

                          data = data.concat([ __DISCORD, (__SHOWPASTE && __DISCORDFULL) ]);  // Avoid "...\n..."!
                          break;
      default:            break;
    }
  }

  if (__SHOWITEM) {
    data = data.concat([ item.toString() ]);  // for debugging purposes
  } else {
    data = data.concat([ '{' + parts + "} " + data.length ]);  // just mark it with a label
  }

  return data;
}

function mapChannelResult(item, parts) {
  const __PARTS = (parts ? parts.split(',').map(part => part.trim()) : []);
  const __ID = item.id;
  const __KIND = item.kind;
  const __SN = item.snippet;
  const __FULLDESC = (__SN && __SN.description);
  const __DESC = (__SHORTDESC && __FULLDESC && (__FULLDESC.length >= __DESCLEN - 1))
                      ? __FULLDESC.substring(0, __DESCLEN) + "..." : __FULLDESC;
  const __SI = item.statistics;
  const __BS = item.brandingSettings;
  let data = [];

  for (part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __ID, __KIND ]);
                          break;
      case 'snippet':     data = data.concat([ __SN.customUrl, __SN.title, (__SHOWDESC && __DESC),
                                                isoTime2de(__SN.publishedAt), isoTime2unix(__SN.publishedAt),
                                                isoTime2rel(__SN.publishedAt), __SN.country ]);
                          break;
      case 'statistics':  data = data.concat([ __SI.viewCount, __SI.subscriberCount, __SI.videoCount ]);
                          break;
      case 'brandingSettings': const __CH = (__BS ? __BS.channel : null);
                          data = data.concat([ __CH.title, (__SHOWDESC && __CH.description) ]);
                          break;
      default:            break;
    }
  }

  if (__SHOWITEM) {
    data = data.concat([ item.toString() ]);  // for debugging purposes
  } else {
    data = data.concat([ '{' + parts + "} " + data.length ]);  // just mark it with a label
  }

  return data;
}

function safeID(video, channel, playlist) {
  if (video) return video;
  if (channel) return channel;
  if (playlist) return playlist;

  return 'jNQXAC9IVRw';  // ZOO Video
}

function getActiveSheet() {
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __ACTIVESHEET = __SPREADSHEET.getActiveSheet();

  return __ACTIVESHEET;
}

function getPasteSheet() {
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __PASTESHEET = __SPREADSHEET.getSheetByName(__PASTESHEETNAME);
  const __ACTIVESHEET = __PASTESHEET.activate();

  return __ACTIVESHEET;
}

function checkVidCol() {
  return checkCol(__VIDCOL);
}

function checkChannelCol() {
  return checkCol(__CHANNELCOL);
}

function checkHandleCol() {
  return checkCol(__HANDLECOL);
}

function checkCol(col) {
  const __ACTIVESHEET = getActiveSheet();
  const __SHEETNAME = __ACTIVESHEET.getSheetName();
  const __CELL = __ACTIVESHEET.getActiveCell();  // or getCurrentCell()?
  const __COL = __CELL.getColumn();
  let ret = false;  Logger.log(__SHEETNAME); Logger.log(__CELL.getA1Notation());

  // TODO: From Editor (not triggered), getSheetName() delivers 'Paste' and getColumn() the 'A1' cell! Always! Why?
  if (__COL === col) {
    ret = (__SHEETNAME === __PASTESHEETNAME);
  }

  return ret;
}

function PT2time(duration, timeFormat = true) {
  const __SECONDS = { 'S': 1, 'M': 60, 'H': 3600, 'D': 86400 };
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

// Test: mapResult()...
function testMap() {
  const __ITEM = { id: { videoId: 'cEAmmT-T0Fg', kind: 'youtube#video' },
                    snippet: { publishedAt: '2025-01-23T16:17:20Z',
                      description: ('This is a reaction to the song "we are the Resurrection" ' +
                      'performed by LOVEBITES live from Memorial for the Warrior\'s Soul.'),
                      channelId: 'UCMRBbkpiK8JnDg9kTQdYPtA', channelTitle: 'vintage_sol',
                      title: 'LOVEBITES-We are the Resurrection OLV(1st time reaction)',
                      publishTime: '2025-01-23T16:17:20Z',
                      tags: [ 'Lovebites', 'Lovebites reaction video', 'Soldier Stands Solitarily Lovebites',
                      'Soldier Stands Solitarily song', 'reaction videos' ], defaultAudioLanguage: 'en-US',
                      categoryId: '19', liveBroadcastContent: 'none' }, contentDetails: { licensedContent: false,
                      contentRating: { },definition: 'hd', dimension: '2d', projection: 'rectangular',
                      caption: 'false', duration: 'PT10M50S' }, topicDetails: { topicCategories: [
                        'https://en.wikipedia.org/wiki/Music', 'https://en.wikipedia.org/wiki/Rock_music' ] },
                      status: { privacyStatus: 'public', publicStatsViewable: true, uploadStatus: 'processed',
                      madeForKids: false, license: 'youtube', embeddable: true }, statistics: { viewCount: '500',
                      likeCount: '130', commentCount: '19', favoriteCount: '0' }, liveStreamingDetails: {
                        actualEndTime: '2025-01-24T22:12:07Z', actualStartTime: '2025-01-24T22:00:09Z',
                        scheduledStartTime: '2025-01-24T22:00:00Z', activeLiveChatId: '[...]' }
                      };  // Mixed a real life entry with a premiere schedule (no chat)
  const __RET = mapResult(__ITEM, __STATSPART);

  Logger.log(__RET);
}

// Test: isoTime2unix(), isoTime2de(), isoTime2rel()...
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

// Test: PT2time()...
function testPT2time() {
  const __PTs = [ 'PT1M29S', 'PT15M8S', 'PT9M8S', 'PT31M20S', 'PT11M55S', 'PT5M49S', 'PT25S', 'PT7M21S', 'PT6M25S',
                  'PT7M52S', 'PT21S', 'PT10M42S', 'PT6M7S', 'PT23S', 'PT7M48S', 'PT13S', 'PT11S', 'PT15M8S',
                  'PT3M29S', 'PT11M59S', 'PT11S', 'PT19M24S', 'PT15S', 'PT17M48S', 'PT12M58S', 'PT11M59S',
                  'PT8M46S', 'PT9M23S', 'PT14S', 'PT25S', 'PT6S', 'PT2H12M22S', 'PT1M', 'PT7M21S', 'PT5M33S',
                  'PT6M6S', 'PT19S', 'PT19S', 'PT13M5S', 'PT20S', 'PT24M30S', 'PT9M50S', 'PT17S', 'PT20M34S',
                  'PT12S', 'PT15S', 'PT11M27S', 'PT38S', 'PT35S',  // 50 real life 'duration' values
                  '', null, 'null', 'P12DT4H36M54S' ];  // ... and some missing ones and a longer one from scratch

  for (duration of __PTs)  {
    const __TIME = PT2time(duration);

    Logger.log(duration + " -> " + __TIME);
  }
}
