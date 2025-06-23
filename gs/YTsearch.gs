
// Parameters for the sheet and the API...
const __ROW = 2;
const __COL = 1;
const __PASTESHEETNAME = 'Paste';
const __INFOSCOL = __COL;
const __VIDCOL = __INFOSCOL;  // 'A' See makeResult() and adapt to correct value!
const __CHANNELCOL = __INFOSCOL + 8;  // 'I' See makeResult() and adapt to correct value!
const __STATSCOL = __INFOSCOL + 17;  // 'R' See makeResult() and adapt to correct value!
const __CHANNELSCOL = __STATSCOL + 34;  // 'AZ' See makeResult() and adapt to correct value!
const __HANDLECOL = __CHANNELSCOL + 3;  // 'BC' See makeChannelResult() and adapt to correct value!
const __LASTCOL = __CHANNELSCOL + 15;  // 'BN' See makeChannelResult() and adapt to correct value!
const __MAX = 50;  // Number of rows to be filled (0..50, default: 5), starting at row 2
const __SHOWITEM = false;  // Do we need the raw JSON package?
const __SHORTDESC = false;  // Cut description fields in order to not break the layout?
const __DESCLEN = (__SHORTDESC ? 50 : -1);  // Max length of description (only "snippet" for videos and channels)
const __SHOWDESC = true;  // Do we need the description at all?
const __SHOWPASTE = true;  // Show the combined summary to paste in Discord!

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
function runYTall() {  Logger.log("Starting runYTall() search...");
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeVID(safeID(info[0], info[1], info[2]))).join(',');
  const __CHANNELIDS = __INFO.map(info => info[__CHANNELCOL - 1]).join(',');
  const __STATS = getStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column (row 2..51) and get STATS and CHANNELS...
function runYTdetailsAll() {
  const __ACTIVESHEET = getPasteSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, 1).getValues();
  const __IDS = __IDCOL.map(entry => safeVID(entry)).join(',');
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELIDS = __INFO.map(info => info[__CHANNELCOL - 1]).join(',');
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column and ChannelIDs from eigths column (row 2..51)
// and get CHANNELS...
function runYTsearch() {
  const __INFO = getSearchInfo(__QUERY, __MAX, __ORDER, __TYPE);
  const __IDS = __INFO.map(info => safeVID(safeID(info[0], info[1], info[2]))).join(',');
  const __STATS = getStats(__IDS);

  return setYTsearchData(__ROW, __COL, __INFO, __STATS);
}

// Main: Get URLs or IDs from first column and transform them into valid VideoIDs (row 2..51)...
function runCleanVIDs() {
  const __ACTIVESHEET = getPasteSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, 3).getValues();
  const __IDS = __IDCOL.map(info => [ safeVID(safeID(info[0], info[1], info[2], null)) ]);

  return setVIDs(__ROW, __COL, __IDS);
}

// Main: Get IDs from first column and ChannelIDs from ninth column (row 2..51)
// and get STATS and CHANNELS...
function runYTdetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, 1).getValues();
  const __IDS = __IDCOL.map(entry => safeVID(entry)).join(',');
  const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, 1).getValues();
  const __CHANNELIDS = __CHANNELIDCOL.join(',');  // Empty entries!
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get ChannelIDs from ninth column (row 2..51) and get stats for CHANNELS...
function runYTchannelDetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, 1).getValues();
  const __CHANNELIDS = __CHANNELIDCOL.map(entry => safeChannelID(entry, 'UC')).join(',');  // Empty entries!
  const __INFO = [];
  const __STATS = [];
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get ChannelIDs from 55th column (row 2..51) and get stats for CHANNELS...
function runYThandleDetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __SINGLEROW = 1;
  const __SINGLECOL = 1;
  const __INFO = [];
  const __STATS = [];
  let ret = true;
  let handle;

  for (let row = __ROW; row < __ROW + __MAX; row++) {
    const __CHANNELHANDLECOL = __ACTIVESHEET.getRange(row, __HANDLECOL, __SINGLEROW, __SINGLECOL).getValues();
    const __CHANNELHANDLE = __CHANNELHANDLECOL.join(',');  // Empty entries!

    if (__CHANNELHANDLE && __CHANNELHANDLE.length) {  Logger.log({ Row: row.toFixed(0), Handle: __CHANNELHANDLE });
      const __CHANNELSTATS = getChannelStatsForHandle(__CHANNELPART, __CHANNELHANDLE, __SINGLEROW);

      ret &= setYTdetailsData(row, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
    }
  }

  return ret;
}

// Main: Clear all areas for INFO, STATS, and CHANNELS...
function runClearAll() {
  return clearDetailsData(__ROW, __COL);
}

// Main: Run nothing, but only if you are active on the 'Paste' sheet!
function triggerOff() {
  return checkVidCol();
}

// Main: Run runClearAll(), but only if you are active on the 'Paste' sheet!
function triggerClearAll() {
  return (checkVidCol() && runClearAll());
}

// Main: Run runYTAll(), but only if you are active on the 'Paste' sheet!
function triggerYTall() {
  return (checkVidCol() && runYTall());
}

// Main: Run runCleanVIDs(), but only if you are changing a videoID (column 'A')!
function triggerCleanVIDs() {
  return (checkVidCol() && runCleanVIDs());
}

// Main: Run runYTdetailsAll(), but only if you are changing a videoID (column 'A')!
function triggerYTdetailsAll() {
  return (checkVidCol() && runYTdetailsAll());
}

// Main: Run runYTchannelDetails(), but only if you are changing a channelID (column 'I')!
function triggerYTchannelDetails() {
  return (checkChannelCol() && runYTchannelDetails());
}

// Main: Run runYThandleDetails(), but only if you are changing a handle of a channel (column 'BC')!
function triggerYThandleDetails() {
  return (checkHandleCol() && runYThandleDetails());
}

function setVIDs(row, col, ids) {  Logger.log("Setting clean setVIDs()...");
  const __ACTIVESHEET = getPasteSheet();
  const __IDLEN = ((ids && ids.length) ? ids.length : 0);
  const __IDWIDTH = ((ids && ids[0] && ids[0].length) ? ids[0].length : 0);
  const __IDCOL = col;

  return   __ACTIVESHEET.getRange(row, __IDCOL, __IDLEN, __IDWIDTH).setValues(ids);
}

function setYTsearchData(row, col, info, stats) {  Logger.log("Setting setYTsearchData() search data...");
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

function setYTdetailsData(row, col, statsCol, info, stats, channelStats) {  Logger.log("Setting setYTdetailsData() details...");
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

  if (__INFOLEN) { __ACTIVESHEET.getRange(row, __INFOCOL, __INFOLEN, __INFOWIDTH).setValues(info); }
  if (__STATLEN) { __ACTIVESHEET.getRange(row, __STATCOL, __STATLEN, __STATWIDTH).setValues(stats); }
  if (__CHANLEN) { __ACTIVESHEET.getRange(row, __CHANCOL, __CHANLEN, __CHANWIDTH).setValues(channelStats); }

  return true;
}

function clearDetailsData(row, col) {  Logger.log("Clearing clearDetailsData() data..."); Logger.log('(' + row + ", " + col + ')');
  const __ACTIVESHEET = getPasteSheet();
  const __INFOLEN = __MAX;
  const __STATLEN = __MAX;
  const __CHANLEN = __MAX;
  const __INFOWIDTH = __STATSCOL - __COL;
  const __STATWIDTH = __CHANNELSCOL - __STATSCOL;
  const __CHANWIDTH = __LASTCOL - __CHANNELSCOL + 1;
  const __INFOCOL = col;
  const __STATCOL = __INFOCOL + __INFOWIDTH;
  const __CHANCOL = __STATCOL + __STATWIDTH;

  if (__INFOLEN) { __ACTIVESHEET.getRange(row, __INFOCOL, __INFOLEN, __INFOWIDTH).clearContent(); }
  if (__STATLEN) { __ACTIVESHEET.getRange(row, __STATCOL, __STATLEN, __STATWIDTH).clearContent(); }
  if (__CHANLEN) { __ACTIVESHEET.getRange(row, __CHANCOL, __CHANLEN, __CHANWIDTH).clearContent(); }

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

function getChannelStatsEx(parts, params) {
  // Logger.log({ id : params.id } ); Logger.log({ maxResults : params.maxResults } );
  // Logger.log({ forHandle : params.forHandle } ); Logger.log({ forUsername : params.forUsername } );
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
                      });  // Logger.log(channelIDs.join(','));

  const __CHANNELIDS = (__PARAMS.id ? __PARAMS.id.split(',') : channelIDs);

  for (let channelID of __CHANNELIDS) {
    if (channelID) {
      const __ENTRY = __CHANNELMAP[channelID];

      channelStats = channelStats.concat([ __ENTRY ]);
    }
  }

  return channelStats;
}

function mapResult(item, parts) {
  const __PARTS = (parts ? parts.split(',').map(part => part.trim()) : []);
  const __KIND = item.kind;
  const __ETAG = item.etag;
  const __ID = item.id;
  const __IDS = (((typeof item.id) === 'string') ? { videoId : __ID, kind: __KIND } : __ID);
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

  for (let part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __IDS.videoId, __IDS.channelId, __IDS.playlistId, __IDS.kind, __ETAG ]);
                          break;
      case 'snippet':     data = data.concat([ __SN.title, (__SHOWDESC && __DESC),
                                                isoTime2de(__SN.publishedAt),
                                                __SN.channelId, __SN.channelTitle,
                                                __SN.liveBroadcastContent,  // 'upcoming', 'live', 'none'
                                                // These one (tags) is missing in 'Search'! Later...
                                                // (__SN.tags ? __SN.tags.join(", ") : ''),
                                                // These two (categoryId and defaultAudioLanguage) are missing in 'Search'! Later...
                                                // category(__SN.categoryId), __SN.categoryId, __SN.defaultAudioLanguage,
                                                isoTime2unix(__SN.publishedAt), isoTime2rel(__SN.publishedAt),
                                                isoTime2de(__SN.publishTime), isoTime2unix(__SN.publishTime),
                                                isoTime2rel(__SN.publishTime)  // See __SN.publishedAt!
                                              ]);
                          break;
      case 'contentDetails': data = data.concat([ // First the delayed data that is not available in 'Search':
                                                  (__SN.tags ? __SN.tags.join(", ") : ''),
                                                  category(__SN.categoryId), __SN.categoryId, __SN.defaultAudioLanguage, // See "snippet"!
                                                  // Now to the proper content details...
                                                  __CD.definition, __CD.caption, __CD.projection,
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
                                                (__LS && isoTime2de(__LS.actualStartTime)),
                                                (__LS && isoTime2unix(__LS.actualStartTime)),
                                                (__LS && isoTime2rel(__LS.actualStartTime)),
                                                (__LS && isoTime2de(__LS.actualEndTime)),
                                                (__LS && isoTime2unix(__LS.actualEndTime)),
                                                (__LS && isoTime2rel(__LS.actualEndTime)),
                                                (__LS && __LS.activeLiveChatId) ]);

                          // Paste string for Discord...
                          const __PUBLISHEDTIME = (__SN && __SN.publishedAt);
                          const __SCHEDULEDTIME = (__LS && __LS.scheduledStartTime);
                          const __ISOVER = (__SN.liveBroadcastContent === 'none');
                          const __ISWAIT = (__SN.liveBroadcastContent === 'upcoming');
                          const __ISLIVE = (__SN.liveBroadcastContent === 'live');
                          const __ISDONE = (__ISOVER && __SCHEDULEDTIME);
                          const __STARTTIME = (__ISWAIT ? __SCHEDULEDTIME : (__ISDONE && (__LS && __LS.actualStartTime)));
                          const __ENDTIME = (__ISDONE && (__LS && __LS.actualEndTime));
                          const __TIME = (__STARTTIME || __PUBLISHEDTIME);  // If premiere, take scheduled, else published!
                          const __MINS = ((isoTime2unix(__SCHEDULEDTIME) - isoTime2unix()) / 60);  // __ISWAIT only!
                          const __DISPMINS = (mins => ((mins < 2) ? "NOW " : "in " + ((mins < 66) ? mins.toFixed(0) + " minutes "
                                                                                  : (mins / 60).toFixed(1) + " hours ")));
                          const __PREMIEREWHEN = (__ISWAIT ? __DISPMINS(__MINS) :  '');
                          const __PREMIERE = (__ISOVER ? '' : "Premiere ") + (__ISLIVE ? "NOW " : __PREMIEREWHEN);
                          const __EXPREMIERE = (__ISDONE ? "Premiere " : '');  // Scheduled, but over now, so it __ISOVER
                          const __URL = "https://youtu.be/" + __IDS.videoId;
                          const __START = (__TIME ? isoTime2rel(__TIME) : '');
                          const __END = (__ENDTIME ? isoTime2rel(__ENDTIME) : '');
                          const __DONE = (__ISDONE ? " DONE (" + __END + ')' : '');
                          const __DISCORD = (__ISOVER ? '[' + __EXPREMIERE + __START + "] "
                                                      : __PREMIERE + '(' + __START + "): ")
                                            + __URL + __DONE;
                          const __CATEGORY = ' ' + category(__SN.categoryId);
                          const __CC = ((__CD && (__CD.caption.toLowerCase() === 'true')) ? "CC " : '');
                          const __LANG = (__SN.defaultAudioLanguage ? __SN.defaultAudioLanguage + ' ' : '');
                          const __VLEN = (__CD.duration === 'P0D') ? '' : PT2time(__CD.duration);  // 'P0D' ??? Strange!
                          const __VLENDISP = (__VLEN ? (__VLEN.startsWith("00:")
                                                        ? __VLEN.substring(3) : __VLEN) : 'live') + ' ';
                          const __DISCORDINFO = "\n[" + __VLENDISP + __CC + __LANG
                                                      + __CD.definition + '(' + __CD.dimension + ')' + __CATEGORY + "] "
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
  const __KIND = item.kind;
  const __ETAG = item.etag;
  const __ID = item.id;
  const __SN = item.snippet;
  const __FULLDESC = (__SN && __SN.description);
  const __DESC = (__SHORTDESC && __FULLDESC && (__FULLDESC.length >= __DESCLEN - 1))
                      ? __FULLDESC.substring(0, __DESCLEN) + "..." : __FULLDESC;
  const __SI = item.statistics;
  const __BS = item.brandingSettings;
  let data = [];

  for (let part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __ID, __KIND, __ETAG ]);
                          break;
      case 'snippet':     data = data.concat([ __SN.customUrl, __SN.title, (__SHOWDESC && __DESC),
                                                isoTime2de(__SN.publishedAt), isoTime2unix(__SN.publishedAt),
                                                isoTime2rel(__SN.publishedAt), __SN.country ]);
                          break;
      case 'statistics':  data = data.concat([ __SI.viewCount, __SI.subscriberCount, __SI.videoCount,
                                                __SN.hiddenSubscriberCount ]);  // Just for the sake of completeness.
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

function safeID(video, channel, playlist, dflt = 'jNQXAC9IVRw') {  // ZOO Video
  if (video) return video;
  if (channel) return channel;
  if (playlist) return playlist;

  return dflt;
}

function safeVID(url, dflt) {  // strips url to pure video-ID...
  const __FULLURL = String(url).trim();
  const __PATTERNS = [ /^(\S{11})$/,
                        /^https?:\/\/www\.youtube\.\S+\/watch\?v=(\S{11})(&\S+=\S+)*$/,
                        /^https?:\/\/www\.youtube\.\S+\/shorts\/(\S{11})\/?((\?\S+=\S+)(&\S+=\S+)*)?$/,
                        /^https?:\/\/youtu\.be\/(\S{11})\/?((\?\S+=\S+)(&\S+=\S+)*)?$/ ];

  for (let pattern of __PATTERNS) {
    if (pattern.test(__FULLURL)) {
      const __URL = __FULLURL.replace(pattern, '$1');
      //Logger.log(__FULLURL + " -> " + __URL);

      return __URL;
    }
  }

  return dflt;
}

function safeChannelID(channelID, prefix = 'UC', dflt = null) {  // strips channelID to pure channel-ID...
  const __ID = String(channelID).trim();
  let id = __ID;

  if (id && prefix && id.startsWith(prefix)) {
    id = id.substring(prefix.length);
  }

  if (id && (id.length === 22)) {
    //Logger.log(__ID + " -> " + id);

    return (prefix + id);
  }

  return dflt;
}

function getActiveSheet() {
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __ACTIVESHEET = __SPREADSHEET.getActiveSheet();

  return __ACTIVESHEET;
}

function getPasteSheet() {
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __ACTIVESHEET = __SPREADSHEET.getActiveSheet();
  const __CELL = __SPREADSHEET.getActiveCell();
  const __PASTESHEET = __SPREADSHEET.getSheetByName(__PASTESHEETNAME);
  const __ACTIVEPASTESHEET = __PASTESHEET.activate();

  __SPREADSHEET.setCurrentCell(__CELL);  // TODO: Restore position

  return __ACTIVEPASTESHEET;
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
  let ret = false;
  Logger.log(__SHEETNAME); Logger.log(__CELL.getA1Notation());

  // TODO: From Editor (not triggered), getSheetName() delivers 'Paste' and getColumn() the 'A1' cell! Always! Why?
  if (__COL === col) {
    ret = true || (__SHEETNAME === __PASTESHEETNAME);
  }

  return ret;
}

const __CATEGORYMAP = {
    1:  'Film & Animation',
    2:  'Autos & Vehicles',
    10: 'Music',
    15: 'Pets & Animals',
    17: 'Sports',
    18: 'Short Movies',
    19: 'Travel & Events',
    20: 'Gaming',
    21: 'Videoblogging',
    22: 'People & Blogs',
    23: 'Comedy',
    24: 'Entertainment',
    25: 'News & Politics',
    26: 'Howto & Style',
    27: 'Education',
    28: 'Science & Technology',
    29: 'Nonprofits & Activism',
    30: 'Movies',
    31: 'Anime/Animation',
    32: 'Action/Adventure',
    33: 'Classics',
    34: 'Comedy',
    35: 'Documentary',
    36: 'Drama',
    37: 'Family',
    38: 'Foreign',
    39: 'Horror',
    40: 'Sci-Fi/Fantasy',
    41: 'Thriller',
    42: 'Shorts',
    43: 'Shows',
    44: 'Trailers'
  };

function category(categoryID) {
  const __CATNAME = __CATEGORYMAP[categoryID];

  return (__CATNAME || '');
}

function PT2time(duration, timeFormat = true) {
  const __SECONDS = { 'S': 1, 'M': 60, 'H': 3600, 'D': 86400 };
  let secs = -1;

  if (duration && duration.startsWith('P')) {
    let s = duration.replace(/^P(.*)T(.*)/, '$1$2');

    if (s === 'P0D') {  // special value!
      return null;  // null instead of '00:00:00' or NaN!
    }

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
  const __DATE = (isoTime ? new Date(isoTime) : new Date());

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
  const __DATE = (isoTime ? new Date(isoTime) : new Date());
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
                  '', null, 'null', 'P0D', 'P12DT4H36M54S' ];  // ... and some missing ones and a longer one from scratch

  for (let duration of __PTs)  {
    const __TIME = PT2time(duration);

    Logger.log(duration + " -> " + __TIME);
  }
}

// Test: safeVID()...
function testSafeVID() {
  const __URLs = [ 'https://www.youtube.com/watch?v=95vBFa2tKsk', 'https://www.youtube.com/watch?v=TnIm1VkWx6Y&t=2s',
                    'https://youtu.be/cCMZK59dfkg', 'http://youtu.be/cCMZK59dfkg?t=5s', '99zsH6iG_6c', 'yYEUGlFNBKc+',
                    'https://www.youtube.com/shorts/JL7ciGyRGpQ?t=2s', ' https://www.youtube.com/shorts/JL7ciGyRGpQ/ ' ];

  for (let url of __URLs)  {
    const __VID = safeVID(url);

    Logger.log(url + " -> " + __VID);
  }
}

// Test: safeChannelID()...
function testSafeChannelID() {
  const __IDs = [ 'UC_j-UIb9-xfQ0TpQZ1gU73A', ' UC_wufvzX3aCyXdrfolZuCBQ ', 'UC2eXdGwoXGwk9eKTnWxeCSQ ', ' 4RhhXZinswhdHhLmWQL7rA',
                  '9f0JONUBVrWHaJF75jDwBA', 'Fn_q3syp4YrRtuHA-Ehi_A', 'l8rWlxwqaOdRFdL38Ezzew', 'r_wpkXp9lDwG0t35vs1Jvg',
                  'sQ4R6ihKh2_-2Fc_vWzA7Q', 'uSOre3pUobWnlFxkSkHqsQ+', 'uSOre3pUobWnlFxkSkHqs' ];

  for (let channelID of __IDs)  {
    const __CHANNELID = safeChannelID(channelID, 'UC', "Successfully found error in channelID");

    Logger.log(channelID + " -> " + __CHANNELID);
  }
}
