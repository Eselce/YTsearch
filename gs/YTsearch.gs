
// Parameters for the sheet and the API...
const __CONFIG = {
      'search': {
                  'query': "lovebites",   // Put search query here!
                  'max': 50,              // Number of rows to be filled (0..50, default: 5), starting at row 2
                  'order': 'date',        // default: 'relevance'
                  'type': 'video',        // default: 'video,channel,playlist'
                  'safeSearch': 'none'
                },
      'request': {
                  'info': 'id, snippet',                      // default data, used in 'stat' and 'channel' as well!
                  'stat': 'statistics, contentDetails, topicDetails, status, liveStreamingDetails',
                  'channel': 'statistics',                    // 'statistics, brandingSettings, localizations'
                  'plinfo': 'contentDetails, status',         // Info about a playlist
                  'pllist': 'contentDetails, status, player', // List of items in a playlist / 'pageInfo, items'
                  'plitem': 'contentDetails, status'          // Info about an item in a playlist
                },
      'std': {
                'video':  {
                            'prefix': ''                      // 0 + 11 = 11 chars
                          },
                'channel': {
                            'prefix': 'UC'                    // 2 + 22 = 24 chars
                          },
                'playlist': {
                            'prefix': 'PL'                    // 2 + 32 = 34 chars
                          },
                'playlistItem': {
                            'prefix': 'UE'                    // 2 + 66 = 68 chars
                          }
              },
      'display': {
                  'table': 'Paste',
                  'row': 2,
                  'col': 2
                },
      'columns': {
                  'len': {
                          'align': 0,
                          'info': 17,     // 'S' See makeResult() and adapt to correct value!
                          'stat': 34,     // 'BA' See makeResult() and adapt to correct value!
                          'channel': 16   // 'BP' See makeChannelResult() and adapt to correct value!
                        },
                  'col': {
                          'video': 1,     // 'B' See makeResult() and adapt to correct value!
                          'channel': 9,   // 'J' See makeResult() and adapt to correct value!
                          'discord': 32,  // 'AX' See makeResult() and adapt to correct value!
                          'handle': 4,    // 'BD' See makeChannelResult() and adapt to correct value!
                          'last': 15      // 'BO' See makeChannelResult() and adapt to correct value!
                        }
                },
      'data': {
                'show': {
                          'item': !false,  // Do we need the raw JSON package?
                          'paste': true,  // Show the combined summary to paste in Discord!
                          'desc': true    // Do we need the description at all?
                        },
                'desc': {
                          'short': false, // Cut description fields in order to not break the layout?
                          'maxlen': 50    // Max length of description (only "snippet" for videos and channels)
                        }
              },
      'datetime': {
                    'string': {
                              'locale': 'de-DE',
                              'tz': 'CET'
                            },
                    'duration': {
                                  'timeformat': true,
                                  'format': 'HH:mm:ss',
                                  'tz': 'UTC'
                                }
                  },
      'default': {
                'video': 'jNQXAC9IVRw',                           // ZOO video
                'channel': 'UC90wxogt_sQrP0Os0HT-xuw',            // LOGEBITES channel
                'playlist': 'PLSFgYQhUDHRj8eKSoe-25VwbwPoYhsmze', // LOVEBITES original music video playlist
                'playlistItem': 'UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS41Mzk2QTAxMTkzNDk4MDhF', // LOVEBITES DBTD
                'dummytime': '2025-01-23T16:17:20Z'
              }
    };

// Internal parameters for the sheet and the API (do not edit!)...
const __ROW = __CONFIG.display.row;
const __COL = __CONFIG.display.col;
const __PASTESHEETNAME = __CONFIG.display.table;
const __TOPROW = 1;
const __LEFTCOL = 1;
const __SINGLEROW = 1;
const __SINGLECOL = 1;
const __INFOSCOL = 1 + __CONFIG.columns.len.align;  // 1-based
const __VIDCOL = addCols(__INFOSCOL, __CONFIG.columns.col.video);
const __CHANNELCOL = addCols(__INFOSCOL, __CONFIG.columns.col.channel);
const __STATSCOL = __INFOSCOL + __CONFIG.columns.len.info;
const __DISCORDCOL = addCols(__INFOSCOL, __CONFIG.columns.col.discord);
const __CHANNELSCOL = __STATSCOL + __CONFIG.columns.len.stat;
const __HANDLECOL = addCols(__CHANNELSCOL, __CONFIG.columns.col.handle);
const __LASTCOL = addCols(__CHANNELSCOL, __CONFIG.columns.col.last);
const __SHOWITEM = __CONFIG.data.show.item;
const __SHORTDESC = ! __CONFIG.data.desc.short;
const __DESCLEN = (__SHORTDESC ? __CONFIG.data.desc.maxlen : -1);
const __SHOWDESC = __CONFIG.data.show.desc;
const __SHOWPASTE = __CONFIG.data.show.paste;

// YT data...
const __VPREFIX = __CONFIG.std.video.prefix;
const __CHPREFIX = __CONFIG.std.channel.prefix;
const __PLPREFIX = __CONFIG.std.playlist.prefix;
const __ITPREFIX = __CONFIG.std.playlistItem.prefix;
const __DEFAULTVIDEO = __CONFIG.default.video;
const __DEFAULTCHANNEL = __CONFIG.default.channel;
const __DEFAULTPLAYLIST = __CONFIG.default.playlist;
const __DEFAULTPLAYLISTITEM = __CONFIG.default.playlistItem;

// Date and time...
const __LOCALE = __CONFIG.datetime.string.locale;
const __TZ = __CONFIG.datetime.string.tz;
const __TIMEFORMAT = __CONFIG.datetime.duration.timeformat;
const __DURFORMAT = __CONFIG.datetime.duration.format;
const __DURTZ = __CONFIG.datetime.duration.tz;

// Output format for sheet positions...
const __DEFDELIMS = [ '(', ', ', ')', ' to ' ];   // '(row, col)'
const __RCDELIMS = [ 'R', 'C', '', '-' ];      // 'RrowCcol'

// Parameters for YTsearch...
const __QUERY = __CONFIG.search.query;
const __MAX = __CONFIG.search.max;
const __PART = __CONFIG.request.info;
const __STATPART = __CONFIG.request.stat;
const __CHANPART = __CONFIG.request.channel;
const __PINFPART = __CONFIG.request.plinfo;
const __LISTPART = __CONFIG.request.pllist;
const __ITEMPART = __CONFIG.request.plitem;
const __ORDER = __CONFIG.search.order;
const __TYPE = __CONFIG.search.type;
const __SEARCH = {
                    'q': syncCell(2, __LEFTCOL, __QUERY),
                    'order': syncCell(3, __LEFTCOL, __ORDER),
                    'type': syncCell(4, __LEFTCOL, __TYPE),
                    'maxResults': __MAX,
                    'safeSearch': __CONFIG.search.safeSearch
                  };

// Parameter for YTdetails...
const __STATSPART = __PART + ", " + __STATPART;
const __CHANNELPART = __PART + ", " + __CHANPART;
const __PLINFOPART = __PART + ", " + __PINFPART;
const __PLLISTPART = __PART + ", " + __LISTPART;
const __PLITEMPART = __PART + ", " + __ITEMPART;

// Main: Search and get STATS and CHANNELS...
function runYTall() {  Logger.log("Starting runYTall() search..."); Logger.log(__SEARCH);
  const __INFO = getSearchInfo(__SEARCH);
  const __IDS = getListFromArr(__INFO, (info => safeVID(safeComboID(info[0], info[1], info[2]))));
  const __CHANNELIDS = getListFromArr(__INFO, (info => info[__CHANNELCOL - 1]));
  const __STATS = getStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get IDs from first column (row 2..51) and get STATS and CHANNELS...
function runYTdetailsAll() {
  //const __ACTIVESHEET = getPasteSheet();
  //const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, __SINGLECOL).getValues();
  //const __IDS = __IDCOL.map(entry => safeVID(entry)).join(',');
  const __IDS = getColumn(__ROW, __COL, __VIDCOL, __SINGLECOL, (entry => safeVID(entry)));
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELIDS = getListFromArr(__INFO, (info => info[__CHANNELCOL - 1]));
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Search and get rudimantal INFO and STATS of those vides in 50 rows (row 2..51)...
function runYTsearch() {
  const __INFO = getSearchInfo(__SEARCH);
  const __IDS = getListFromArr(__INFO, (info => safeVID(safeComboID(info[0], info[1], info[2]))));
  const __STATS = getStats(__IDS);

  return setYTsearchData(__ROW, __COL, __INFO, __STATS);
}

// Main: Get URLs or IDs from first column and transform them into valid VideoIDs (row 2..51)...
function runCleanVIDs() {
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': __ROW,
                        'col': __COL,
                        'max': __MAX * 20,  // TODO: clean __MAX extension
                        'fullCol': true,
                        'items': {
                                    'ids': {
                                              'col': __VIDCOL,
                                              'width': 3
                                            }
                                  }
                     };

  const __IDCOL = copyData(__TEMPLATE).ids;
  const __IDS = getListFromArr(__IDCOL, (info => [ safeVID(safeComboID(info[0], info[1], info[2], null) /*, __DEFAULTVIDEO*/) ]), null);
  //Logger.log(__IDCOL); Logger.log(__IDS);

  __TEMPLATE.items.ids.width = __SINGLECOL;  // TODO: Really, really ugly!

  Logger.log("Setting " + __IDS.length + " clean VIDs...");
  return populateData(__IDS, __TEMPLATE );  // populateData({ 'ids': __IDS }, __TEMPLATE);
}

// Main: Get IDs from first column and ChannelIDs from ninth column (row 2..51)
// and get STATS and CHANNELS...
function runYTdetails() {
  //const __ACTIVESHEET = getPasteSheet();
  //const __IDCOL = __ACTIVESHEET.getRange(__ROW, __VIDCOL, __MAX, __SINGLECOL).getValues();
  //const __IDS = __IDCOL.map(entry => safeVID(entry)).join(',');
  const __IDS = getColumn(__ROW, __COL, __VIDCOL, __SINGLECOL, (entry => safeVID(entry)));
  //const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, __SINGLECOL).getValues();
  //const __CHANNELIDS = __CHANNELIDCOL.join(',');  // Empty entries!
  const __CHANNELIDS = getColumn(__ROW, __COL, __CHANNELCOL, __SINGLECOL);  // Empty entries!
  const [ __INFO, __STATS ] = getInfoStats(__IDS);
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __STATSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get ChannelIDs from ninth column (row 2..51) and get stats for CHANNELS...
function runYTchannelDetails() {
  //const __ACTIVESHEET = getPasteSheet();
  //const __CHANNELIDCOL = __ACTIVESHEET.getRange(__ROW, __CHANNELCOL, __MAX, __SINGLECOL).getValues();
  //const __CHANNELIDS = __CHANNELIDCOL.map(entry => safeChannelID(entry, null, __CHPREFIX)).join(',');  // Empty entries!
  const __CHANNELIDS = getColumn(__ROW, __COL, __VIDCOL, __SINGLECOL, (entry => safeChannelID(entry, null, __CHPREFIX)));   // Empty entries!
  const __INFO = [];
  const __STATS = [];
  const __CHANNELSTATS = getChannelStats(__CHANNELPART, __CHANNELIDS, __MAX);

  return setYTdetailsData(__ROW, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
}

// Main: Get ChannelIDs from 55th column (row 2..51) and get stats for CHANNELS...
function runYThandleDetails() {
  const __ACTIVESHEET = getPasteSheet();
  const __CHANNELHANDLES = getColumn(__ROW, __COL, __HANDLECOL, __SINGLECOL, null);
  const __INFO = [];
  const __STATS = [];
  let ret = true;
  let handle;

  for (let row = 0; row < __CHANNELHANDLES; row++) {
    //const __CHANNELHANDLECOL = __ACTIVESHEET.getRange(row, __HANDLECOL, __SINGLEROW, __SINGLECOL).getValues();
    //const __CHANNELHANDLE = __CHANNELHANDLECOL.join(',');  // Empty entries!
    const __CHANNELHANDLE = __CHANNELHANDLES[row];  // Empty entries!

    if (__CHANNELHANDLE && __CHANNELHANDLE.length) {  Logger.log({ Row: (row + __TOPROW).toFixed(0), Handle: __CHANNELHANDLE });
      const __CHANNELSTATS = getChannelStatsForHandle(__CHANNELPART, __CHANNELHANDLE, __SINGLEROW);

      ret = ret && setYTdetailsData(row, __COL, __CHANNELSCOL, __INFO, __STATS, __CHANNELSTATS);
    }
  }

  return ret;
}

// Main: Get a playlist ID from $A$6 and show all the videos of this playlist in 50 rows (row 2..51)...
function runYTplaylist() {
  const __PLAYLISTID = syncCell(6, 1, __DEFAULTPLAYLIST, safePlaylistID);
  const __INFO = getPlaylistItems(__PLAYLISTID);
  const __IDS = getListFromArr(__INFO, (info => safeVID(info[0])));
  const __STATS = null;  // getStats(__IDS);

  return setYTsearchData(__ROW, __COL, __INFO, __STATS);
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

function getColumn(row, col, itemCol, width, mapFun, join = ',') {
  const __STARTROW = (row || __ROW);
  const __STARTCOL = (col || __COL);
  const __ITEMCOL = (itemCol || __LEFTCOL);
  const __ITEMLEN = __MAX;
  const __ITEMWIDTH = (width || __SINGLECOL);
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': __STARTROW,
                        'col': __STARTCOL,
                        'fullCol': true,
                        'items': {
                                    'data': {
                                              'col': __ITEMCOL,
                                              'len': __ITEMLEN,
                                              'width': __ITEMWIDTH
                                            }
                                  }
                     };
  const __DATA = copyData(__TEMPLATE).data;

  return getListFromArr(__DATA, mapFun, join);
}

// Rearrange an array arr (subset) like the given filterIndex, where indexFun determines the index key in arr (default: id)...
function getFilterArr(arr, filterIndex, indexFun, sorted) {
  const __ARR = (arr || []);
  const __INDEX = (filterIndex || []);
  const __FILTER = (indexFun || (entry => entry.id));
  const __ASCENDING = sorted;  // Optimize filtering for filterIndex sorted ascending in arr (subset)!
  const __RET = [];
  let pos = 0;
  let count = 0;

  //Logger.log(__ARR); Logger.log(__INDEX); Logger.log(__FILTER(__ARR[0]));

  for (let index = 0, pos = 0; index < __ARR.length; index++, pos++) {
    const __ENTRY = __ARR[index];
    const __KEY = __FILTER(__ENTRY);

    if (__ASCENDING) {  // filterIndex has the same order as arr...
      while ((pos < __INDEX.length) && (__KEY !== __INDEX[pos])) {
        pos++;
      }

      if (pos >= __INDEX.length) {  // Error: Not found!
        break;
      }
    } else {  // unsorted, takes longer!
      pos = __INDEX.findIndex(key => (key === __KEY));
    }

    count++;
    __RET[pos] = __ENTRY;
  }

  if (count !== __ARR.length) {
    Logger.log("Error in getFilterArr(): Could only find " + count + " of " + __ARR.length + " entries while filtering!");
  }

  return __RET;
}

function getListFromArr(arr, mapFun, join = ',') {
  const __DATA = (arr || []);
  const __MAPPED = normal(__DATA, mapFun && (data => data.map(mapFun, data)));
  const __JOINED = normal(__MAPPED, join && (arr => arr.join(join)));

  return __JOINED;
}

function normal(val, fun) {
  const __VAL = ((fun && val) ? fun(val) : val);

  return __VAL;
}

function getCell(row, col, dflt, fun, table) {
  const __DATA = copyDataEx(table, row, col).data;
  const __ROW =  (__DATA || [])[0];
  const __CELLENTRY = (__ROW || [])[0];
  const __ENTRY = normal(__CELLENTRY, fun);

  Logger.log("CELL " + A1(row, col, table) + " = " + __ENTRY);

  return (__ENTRY || normal(dflt, fun));
}

function setCell(row, col, entry, fun, table) {
  const __ENTRY = normal(entry, fun);
  const __DATA = [ [ __ENTRY ] ];  // 1x1 range

  Logger.log("CELL " + A1(row, col, table) + " := " + __DATA);

  return (populateDataEx(table, row, col, __DATA) ? __ENTRY : null);
}

function syncCell(row, col, dflt, fun, table) {
  const __ENTRY = getCell(row, col, null, null, table);

  if (__ENTRY !== dflt) {
    const __SETENTRY = (normal(__ENTRY, fun) || dflt);  // This is just for checking if entry is normalized! In setCell() anyway...

    return setCell(row, col, __SETENTRY, fun, table);
  }

   return normal(__ENTRY, fun);
}

function setVIDsObsolete(row, col, ids) {  Logger.log("Setting clean setVIDs()...");
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': row,
                        'col': col
                     };
  const __DATA = ids;

  return populateData(__DATA, __TEMPLATE);
}

function setVIDsOld(row, col, ids) {  Logger.log("Setting clean setVIDs()...");
  const __ACTIVESHEET = getPasteSheet();
  const __IDLEN = ((ids && ids.length) ? ids.length : 0);
  const __IDWIDTH = ((ids && ids[0] && ids[0].length) ? ids[0].length : 0);
  const __IDCOL = col;

  return   __ACTIVESHEET.getRange(row, __IDCOL, __IDLEN, __IDWIDTH).setValues(ids);
}

function setYTsearchData(row, col, info, stats) {  Logger.log("Setting setYTsearchData() search data...");
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': row,
                        'col': col,
                        'items': {
                                    'info': { 'col': __INFOSCOL },
                                    'stat': { 'col': __STATSCOL }
                                  }
                     };
  const __DATA = {
                    'info': info,
                    'stat': stats
                  };

  return populateData(__DATA, __TEMPLATE);
}

function setYTsearchDataOld(row, col, info, stats) {  Logger.log("Setting setYTsearchData() search data...");
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
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': row,
                        'col': col,
                        'items': {
                                    'info': { 'col': __INFOSCOL },
                                    'stat': { 'col': statsCol },
                                    'channel': true
                                  }
                     };
  const __DATA = {
                    'info': info,
                    'stat': stats,
                    'channel': channelStats
                  };

  return populateData(__DATA, __TEMPLATE);
}

function setYTdetailsDataOld(row, col, statsCol, info, stats, channelStats) {  Logger.log("Setting setYTdetailsData() details...");
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

function clearDetailsData(row, col) {  Logger.log("Clearing clearDetailsData() data..."); Logger.log(tupel(row, col));
  const __INFOWIDTH = __STATSCOL - __INFOSCOL;
  const __STATWIDTH = __CHANNELSCOL - __STATSCOL;
  const __CHANWIDTH = __LASTCOL - __CHANNELSCOL + 1;
  const __INFOCOL = __INFOSCOL;
  const __STATCOL = __INFOCOL + __INFOWIDTH;
  const __CHANCOL = __STATCOL + __STATWIDTH;
  const __TEMPLATE = {
                        'table': __PASTESHEETNAME,
                        'row': row,
                        'col': col,
                        'clearCol': true,
                        'max': __MAX,
                        'items': {
                                    'info': { 'col': __INFOCOL, 'width': __INFOWIDTH },
                                    'stat': { 'col': __STATCOL, 'width': __STATWIDTH },
                                    'channel': { 'col': __CHANCOL, 'width': __CHANWIDTH }
                                  }
                     };

  return populateData(null, __TEMPLATE);
}

function clearDetailsDataOld(row, col) {  Logger.log("Clearing clearDetailsData() data..."); Logger.log(tupel(row, col));
  const __ACTIVESHEET = getPasteSheet();
  const __INFOLEN = __MAX;
  const __STATLEN = __MAX;
  const __CHANLEN = __MAX;
  const __INFOWIDTH = __STATSCOL - __INFOSCOL;
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

function copyData(template) {
  const __CONF = (template || { });

  return copyDataEx(__CONF.table, __CONF.row, __CONF.col, __CONF.items, __CONF);
}

function copyDataEx(table, row, col, items, config) {
  const __TABLE = (table || __PASTESHEETNAME);
  const __STARTROW = (row || __ROW);
  const __STARTCOL = (col || __COL);
  const __DATA = { };
  const __ITEMS = (items || { 'data': true });
  const __CONF = (config || { });  // Just for further global parameters!
  const __ACTIVESHEET = setActiveSheet(__TABLE);
  let nextRow = __TOPROW;  // relative to __STARTROW!
  let nextCol = __LEFTCOL;  // relative to __STARTCOL!
  let lastRow = nextRow;
  let lastCol = nextCol;

  //Logger.log("Retrieving data from " + pos(__STARTROW, __STARTCOL, __TABLE) + "...");
  //Logger.log({ 'items': __ITEMS, 'data': Object.keys(__ITEMS) });

  for (const [key, format] of Object.entries(__ITEMS)) {
    if (format) {
      const __ITEMROW = addCols(__STARTROW, (format.row || ((format.col === lastCol) ? nextRow : __TOPROW)));  // Top if not same col specified!
      const __ITEMCOL = addCols(__STARTCOL, (format.col || nextCol));
      const __ITEMLEN = (format.len || __SINGLEROW);
      const __ITEMWIDTH = (format.width || __SINGLECOL);
      const __ITEMMAX = (format.max || __CONF.max || __MAX);
      const __FULLCOL = ((((typeof format.fullCol) !== 'undefined') || ((typeof __CONF.fullCol) !== 'undefined'))
                          ? (format.fullCol || __CONF.fullCol) : false);
      const __ITEMRANGE = __ACTIVESHEET.getRange(__ITEMROW, __ITEMCOL, __ITEMLEN, __ITEMWIDTH);
      const __COLRANGE = __ACTIVESHEET.getRange(__STARTROW, __ITEMCOL, __ITEMMAX, __ITEMWIDTH);
      const __GETVALUES = ((__ITEMLEN > 0) && (__ITEMWIDTH > 0));

      if (__GETVALUES) {
        const __ITEM = (__FULLCOL ? __COLRANGE : __ITEMRANGE).getValues();

        if (__ITEM && ! Array.isArray(__ITEM)) {
          Logger.log("Error in copyDataEx(): __DATA[" + key + "] with keys (" + Object.keys(__ITEM) + ") is invalid!");

          return null;
        } else {
            const __ACTLEN = (((__ITEM && __ITEM.length) ? __ITEM.length : format.len) || __SINGLEROW);
            const __ACTWIDTH = (((__ITEM && __ITEM[0] && __ITEM[0].length) ? __ITEM[0].length : format.width) || __SINGLECOL);

            lastRow = (__FULLCOL ? __TOPROW : (__ITEMROW - __STARTROW + __TOPROW));
            lastCol = __ITEMCOL - __STARTCOL + __LEFTCOL;
            nextRow = (__FULLCOL ? __ITEMMAX + __TOPROW : (lastRow + __ACTLEN));
            nextCol = lastCol + __ACTWIDTH;

            Logger.log('Key = ' + key // + " -> " + __ITEM
                      + " @ " + posRange(__ITEMROW, __ITEMCOL, nextRow - lastRow, __ACTWIDTH, __TABLE)
                      + ", size = " + tupel(__ACTLEN, __ACTWIDTH)
                      + ", relative " + range(lastRow, lastCol, nextRow - lastRow, __ACTWIDTH)
                      + (__FULLCOL ? " FULLCOL" : ''));

          __DATA[key] = __ITEM;
        }
      } else {
        Logger.log("No data retrieved for __DATA[" + key + ']');
      }
    }
  }

  Logger.log("Successfully retrieved data from " + pos(__STARTROW, __STARTCOL, __TABLE));

  return __DATA;
}

function populateData(data, template) {
  const __CONF = (template || { });
  const __DATA = data;

  return populateDataEx(__CONF.table, __CONF.row, __CONF.col, __DATA, __CONF.items, __CONF);
}

function populateDataEx(table, row, col, data, items, config) {
  const __TABLE = (table || __PASTESHEETNAME);
  const __STARTROW = (row || __ROW);
  const __STARTCOL = (col || __COL);
  const __ITEMS = (items || { });
  const __CONF = (config || { });  // Just for further global parameters!
  const __DATA = packDataParam(data, __ITEMS);
  const __KEYS = Object.keys(__DATA);
  const __ACTIVESHEET = setActiveSheet(__TABLE);
  let nextRow = __TOPROW;  // relative to __STARTROW!
  let nextCol = __LEFTCOL;  // relative to __STARTCOL!
  let lastRow = nextRow;
  let lastCol = nextCol;

  if (! Object.keys(__ITEMS).length) {
    // Simple column blocks...
    // Defining the data blocks...
    for (key of __KEYS) {
      __ITEMS[key] = true;
    }
  }

  //Logger.log("Populating " + pos(__STARTROW, __STARTCOL, __TABLE) + "...");
  Logger.log({ 'items': __ITEMS, 'data':  (__DATA ? __KEYS : __DATA) });

  for (key of __KEYS) {
    Logger.log("data[" + key + "] size = " + sizeTupel(__DATA[key]));
  } 

  for (const [key, format] of Object.entries(__ITEMS)) {
    const __ITEMRAW = __DATA[key];

    if (__ITEMRAW && ! Array.isArray(__ITEMRAW)) {
      Logger.log("Error in populateDataEx(): __DATA[" + key + "] with keys (" + Object.keys(__ITEMRAW) + ") is invalid!");

      return false;
    } else if (format) {
      const __ITEM = filterField(__ITEMRAW, globalFilter);
      const __ITEMROW = addCols(__STARTROW, (format.row || ((format.col === lastCol) ? nextRow : __TOPROW)));  // Top if not same col specified!
      const __ITEMCOL = addCols(__STARTCOL, (format.col || nextCol));
      const __ITEMLEN = (((__ITEM && __ITEM.length) ? __ITEM.length : format.len) || __SINGLEROW);
      const __ITEMWIDTH = (((__ITEM && __ITEM[0] && __ITEM[0].length) ? __ITEM[0].length : format.width) || __SINGLECOL);
      const __ITEMMAX = (format.max || __CONF.max || __MAX);
      const __ITEMRANGE = __ACTIVESHEET.getRange(__ITEMROW, __ITEMCOL, __ITEMLEN, __ITEMWIDTH);
      const __CLEARRANGE = __ACTIVESHEET.getRange(__STARTROW, __ITEMCOL, __ITEMMAX, __ITEMWIDTH);
      const __CLEAR = (__CONF.clear || format.clear);
      const __CLEARCOL = (__CONF.clearCol || format.clearCol);
      const __SETVALUES = (__ITEM && __ITEMLEN && __ITEM.length);  // TODO: That last condition should never be problematic, but it is with errors!

      lastRow = (__CLEARCOL ? __TOPROW : (__ITEMROW - __STARTROW + __TOPROW));
      lastCol = __ITEMCOL - __STARTCOL + __LEFTCOL;
      nextRow = (__CLEARCOL ? __ITEMMAX + __TOPROW : (lastRow + __ITEMLEN));
      nextCol = lastCol + __ITEMWIDTH;

      Logger.log('Key = ' + key // + " -> " + __ITEM
                + " @ " + posRange(__ITEMROW, __ITEMCOL, nextRow - lastRow, __ITEMWIDTH, __TABLE)
                + ", size = " + tupel(__ITEMLEN, __ITEMWIDTH)
                + ", relative " + range(lastRow, lastCol, nextRow - lastRow, __ITEMWIDTH)
                + (__CLEARCOL ? " CLEARCOL" : (__CLEAR ? " CLEAR" : '')));

      if (__CLEARCOL) {
        __CLEARRANGE.clearContent();
      } else if (__CLEAR) {
        __ITEMRANGE.clearContent();
      }

      if (__SETVALUES) {
        __ITEMRANGE.setValues(__ITEM);
      }
    }
  }

  Logger.log("Successfully populated " + pos(__STARTROW, __STARTCOL, __TABLE));

  return true;
}

function packDataParam(data, items) {
  const __ITEMS = (items || { });

  if (data && Array.isArray(data)) {
    const __KEYS = Object.keys(__ITEMS);
    const __KEY = ((__KEYS.length === 1) ? __KEYS[0] : 'data');
    const __DATA = { };

    __DATA[__KEY] = data;

    return __DATA;
  } else {
    return (data || { });
  }
}

function getSearchInfo(search) {
  const __SEARCH = (search || { });

  return getYTlist('Search', __PART, __SEARCH, mapResult, __PART /*, 'id', null, __MAX*/);
}

function getStats(IDs) {
  return getYTlist('Videos', __STATSPART, { 'id': IDs }, mapResult, __STATPART, 'id', (entry => safeVID(entry[__DISCORDCOL - 1])) /*, __MAX*/);
}

function getInfoStats(IDs) {
  return getYTlist('Videos', __STATSPART, { 'id': IDs }, mapResult, [ __PART, __STATPART ] /*, 'id', null, __MAX*/);
}

function getChannelStats(parts, channelIDs, max) {
  const __PARAMS = { 'id': channelIDs, 'maxResults': max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsForHandle(parts, handle, max) {
  const __PARAMS = { 'forHandle': handle, 'maxResults': max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsForUsername(parts, username, max) {
  const __PARAMS = { 'forUsername': username, 'maxResults': max };

  return getChannelStatsEx(parts, __PARAMS);
}

function getChannelStatsEx(parts, params) {
  // Logger.log({ id : params.id } ); Logger.log({ maxResults : params.maxResults } );
  // Logger.log({ forHandle : params.forHandle } ); Logger.log({ forUsername : params.forUsername } );
  const __SELECT = parts;
  const __PARAMS = params;
  const __EXTRACT = __SELECT;
  const __CHANNELSTATS = getYTlist('Channels', __SELECT, __PARAMS, mapChannelResult, __EXTRACT /*, 'id', null, __MAX*/);
  const __CHANNELMAP = { };
  let channelIDs = [];
  let channelStats = [];
  let count = 0;

  __CHANNELSTATS.map(function(item) {
                        const __CHANNELID = item[0];

                        channelIDs[count++] = __CHANNELID;
                        __CHANNELMAP[__CHANNELID] = item;
  
                        return item;
                      });  // Logger.log(getListFromArr(channelIDs));

  const __CHANNELIDS = (__PARAMS.id ? __PARAMS.id.split(',') : channelIDs);

  for (let channelID of __CHANNELIDS) {
    if (channelID) {
      const __ENTRY = __CHANNELMAP[channelID];

      channelStats = channelStats.concat([ __ENTRY ]);
    }
  }

  return channelStats;
}

function getPlaylistItems(PlaylistID) {  Logger.log("Starting PlaylistItem list()...");
  return getYTlist('PlaylistItems', __ITEMPART, {
                                                  'playlistId': PlaylistID  // 'playlistId' single ID, 'id' comma separated
                                                }, mapPlaylistResult, __PLITEMPART /*, 'id', null, __MAX*/);
}

// Multi purpose function for any list from YouTube, including multiple pages, with multiple post production via mapFun.
function getYTlist(type, select, params, mapFun, extractOrArr, idKey, idFun, maxTotal, max) {
  const __TYPE = (type || 'Videos');
  const __FUN = YouTube[__TYPE].list;
  const __SELECT = (select || { });
  const __PARAMS = (Object.assign(params) || { });  // We want to change the object content!
  const __MULTI = Array.isArray(extractOrArr);
  const __EXTRACT = (__MULTI ? extractOrArr : [ extractOrArr ]);
  const __MAPFUN = (mapFun || ((item, extract) => item));
  const __IDKEY = (idKey || 'id');
  const __IDS = __PARAMS[__IDKEY];
  const __IDARR = (__IDS && __IDS.split(','));
  const __IDPARTS = [];
  const __FILTER = (idFun || (entry => entry[0]));
  const __MAXTOTAL = (maxTotal || Number.MAX_SAFE_INTEGER);
  const __MAXPACKET = (max || __MAX);
  const __IDCOUNT = (__IDARR ? __IDARR.length : __MAXPACKET);
  const __PARTCOUNT = (__IDCOUNT - 1) / __MAXPACKET;  // Decimal number, integer only for first id on page!
  const __RESULT = [];
  let restTotal = __MAXTOTAL;
  let count = 0;

  Logger.log(__SELECT); Logger.log(__EXTRACT); Logger.log(restTotal);

  for (let i = 0; i < __EXTRACT.length; i++) {
    __RESULT[i] = [];
  }

  if (__IDARR) {
    for (let i = 0; i < __PARTCOUNT; i++) {
      __IDPARTS[i] = getListFromArr(__IDARR.slice(i * __MAXPACKET, (i + 1) * __MAXPACKET));
    }
  } else {
    __IDPARTS[0] = __IDS;
  }

  for (let ids of __IDPARTS) {
    const __INDEX = (ids && ids.split(','));
    let nextPageToken = (__PARAMS.pageToken || '');

    __PARAMS[__IDKEY] = ids;

    while ((nextPageToken != null) && (restTotal > count)) {
      const __PACKETMAX = Math.min(restTotal, __MAXPACKET);
    
      __PARAMS.pageToken = nextPageToken;
      __PARAMS.maxResults = __PACKETMAX;

      Logger.log(__PARAMS); Logger.log((count + 1) + " - " + (count + __PACKETMAX));

      const __RESPONSE = __FUN(__SELECT, __PARAMS);
      const __RAWITEMS = (__RESPONSE && __RESPONSE.items);

      Logger.log("Got " + __TYPE + " results, len = " + (__RESPONSE && __RESPONSE.items && __RESPONSE.items.length));

      for (let i = 0; i < __EXTRACT.length; i++) {
        const __ITEMS = (__RAWITEMS ? __RAWITEMS.map(item => __MAPFUN(item, __EXTRACT[i])) : []);
        const __FILTERITEMS = getFilterArr(__ITEMS, __INDEX, __FILTER, true);

        __RESULT[i] = __RESULT[i].concat(__ITEMS);
      }
    
      nextPageToken = __RESPONSE.nextPageToken;
      count += __MAXPACKET;
      restTotal -= __MAXPACKET;  // or actual length!
    }
  }

  return (__MULTI ? __RESULT : __RESULT[0]);
}

function getSearchInfoOld(search) {
  const __SEARCH = (search || { });
  const __SELECT = __PART;
  const __EXTRACT = __SELECT;
  const __LIST = YouTube.Search.list(__SELECT, __SEARCH);
  const __RET = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return __RET;
}

function getStatsOld(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __LIST = YouTube.Videos.list(__SELECT, { 'id': IDs });
  const __STATS = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return __STATS;
}

function getInfoStatsOld(IDs) {
  const __SELECT = __STATSPART;
  const __EXTRACT = __STATPART;
  const __EXTRACTINFO = __PART;
  const __LIST = YouTube.Videos.list(__SELECT, { 'id': IDs });
  const __INFO = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACTINFO)) : []);
  const __STATS = (__LIST.items ? __LIST.items.map(item => mapResult(item, __EXTRACT)) : []);

  return [ __INFO, __STATS ];
}

function getChannelStatsExOld(parts, params) {
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
                      });  // Logger.log(getListFromArr(channelIDs));

  const __CHANNELIDS = (__PARAMS.id ? __PARAMS.id.split(',') : channelIDs);

  for (let channelID of __CHANNELIDS) {
    if (channelID) {
      const __ENTRY = __CHANNELMAP[channelID];

      channelStats = channelStats.concat([ __ENTRY ]);
    }
  }

  return channelStats;
}

function getPlaylistItemsOld(PlaylistID) {  Logger.log("Starting PlaylistItem list()...");
  const __SELECT = __ITEMPART;  // __LISTPART, __PINFPART
  const __EXTRACT = __PLITEMPART;  // __PLLISTPART, __INFOPART
  Logger.log(PlaylistID); Logger.log(__SELECT); Logger.log(__EXTRACT);
  //const __LIST = YouTube.PlaylistItems.list(__SELECT, { 'id': PlaylistID });    // 'playlistId' single ID, 'id' comma separated
  const __LIST = YouTube.PlaylistItems.list(__SELECT, {
                                                        'playlistId': PlaylistID, // 'playlistId' single ID, 'id' comma separated
                                                        'maxResults': __MAX
                                                      });
  const __STATS = (__LIST.items ? __LIST.items.map(item => mapPlaylistResult(item, __EXTRACT)) : []);

  return __STATS;
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

function mapPlaylistResult(item, parts) {
  const __PARTS = (parts ? parts.split(',').map(part => part.trim()) : []);
  const __KIND = item.kind;  // "youtube#playlistItemListResponse",
  const __ETAG = item.etag;
  const __NEXT = item.nextPageToken;
  const __PREV = item.prevPageToken;
  const __ID = item.id;
  const __CD = item.contentDetails;
  const __IDS = (((typeof item.id) === 'string') ? { videoId: __CD.videoId, entryId: __ID, kind: __KIND } : __ID);
  const __SN = (item.snippet || { });  // Empty entries for PlaylistItem list to fill the gaps!
  const __RI = (__SN && __SN.resouceId);
  const __FULLDESC = (__SN && __SN.description);
  const __DESC = ((__SHORTDESC && __FULLDESC && (__FULLDESC.length >= __DESCLEN - 1))
                      ? __FULLDESC.substring(0, __DESCLEN) + "..." : __FULLDESC);
  const __PI = item.pageInfo;
  const __IT = item.items;
  const __SU = item.status;
  let data = [];

  for (let part of __PARTS) {
    switch (part) {
      case 'id':          data = data.concat([ __IDS.videoId, __IDS.channelId, __IDS.entryId, __IDS.kind, __ETAG ]);
                          //data = data.concat([ __IDS.videoId, __IDS.channelId, __IDS.playlistId, __IDS.kind, __ETAG ]);
                          break;
      case 'snippet':     /*data = data.concat([ __SN.title, (__SHOWDESC && __DESC),
                                                isoTime2de(__SN.publishedAt),
                                                __SN.channelId, __SN.channelTitle,
                                                __SN.videoOwnerChannelId, __SN.videoOwnerChannelTitle,
                                                __SN.playlistId, __SN.position,
                                                (__RI && __RI.kind), (__RI && __RI.videoId),
                                                isoTime2unix(__SN.publishedAt), isoTime2rel(__SN.publishedAt)
                                              ]);*/
                          break;
      case 'pageInfo':    //data = data.concat([ __PI.totalResults, __PI.resultsPerPage ]);
                          break;
      case 'items':       //data = data.concat([ getListFromArr(__IT, (item => String(item))) ]);
                          break;
      case 'contentDetails': data = data.concat([ // First the delayed data that is not available in 'Search':
                                                  //(__SN.tags ? __SN.tags.join(", ") : ''),
                                                  //category(__SN.categoryId), __SN.categoryId, __SN.defaultAudioLanguage, // See "snippet"!
                                                  // Now to the proper content details...
                                                  //__CD.videoId,                         // already done in 'id'
                                                  //__CD.startAt, __CD.endAt, __CD.note,  // startAt/endAt/note are obsolete!
                                                  //__CD.videoPublishedAt                 // see below...
                                                  __SN.title, (__SHOWDESC && __DESC),
                                                  isoTime2de(__CD.videoPublishedAt),
                                                  __SN.channelId, __SN.channelTitle,
                                                  __SN.liveBroadcastContent,
                                                  isoTime2unix(__CD.videoPublishedAt), isoTime2rel(__CD.videoPublishedAt)
                                                ]);
                          break;
      case 'status':      for (let i = 0; i < 23; i++) { data = data.concat([ null ]); }  // Fill some gaps...
                          data = data.concat([ __SU.privacyStatus ]);
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

function safeComboID(video, channel, playlist, dflt) {
  if (video) return video;
  if (channel) return channel;
  if (playlist) return playlist;

  return dflt;
}

function safeVID(url, dflt = null, prefix = __VPREFIX) {  // strips url or VID to pure video-ID...
  const __PATTERNS = [  // /^([0-9A-Za-z_\-]{11})$/,  // This one is also done by the 4th of the other regExps!
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/watch\?v=([0-9A-Za-z_\-]{11})(?:&\S+=\S+)*(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/shorts\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/live\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/youtu\.be\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^(?:[0-9\s,]*,)?([0-9A-Za-z_\-]{11})(?:,[\w\s,./\-=?:]*)?$/,
                        /^\[.*\] https?:\/\/youtu\.be\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?: DONE \(.*\))?$/ ];

  return safeID(url, dflt, __PATTERNS, prefix);
}

function safeChannelID(url, dflt = null, prefix = __CHPREFIX) {  // strips url or channelID to pure channel-ID...
  const __PATTERNS = [ /^\s*https?:\/\/(?:www|m)\.youtube\.\S+\/channel\/UC([0-9A-Za-z_\-]{22})(?:&\S+=\S+)*\s*$/,
                        /^(?:[0-9\s,]*,)?(?:UC)?([0-9A-Za-z_\-]{22})(?:,[\w\s,./\-=?:]*)?$/ ];

  return safeID(url, dflt, __PATTERNS, prefix);
}

function safePlaylistID(url, dflt = null, prefix = __PLPREFIX) {  // strips url or PLID to pure playlist-ID...
  const __PATTERNS = [ /^\s*https?:\/\/(?:www|m)\.youtube\.\S+\/playlist\?list=PL([0-9A-Za-z_\-]{32})(?:&\S+=\S+)*\s*$/,
          /^\s*https?:\/\/(?:www|m)\.youtube\.\S+\/watch\?v=(?:[0-9A-Za-z_\-]{11})&list=PL([0-9A-Za-z_\-]{32})&index=(\d+)(?:&\S+=\S+)*\s*$/,
          /^\s*https?:\/\/(?:www|m)\.youtube\.\S+\/shorts\/(?:[0-9A-Za-z_\-]{11})\/?\?list=PL([0-9A-Za-z_\-]{32})&index=(\d+)(?:&\S+=\S+)*\s*$/,
          /^\s*https?:\/\/youtu\.be\/(?:[0-9A-Za-z_\-]{11})\/\?&list=PL([0-9A-Za-z_\-]{32})&index=(\d+)(?:&\S+=\S+)*?\s*$/,
          /^(?:[0-9\s,]*,)?(?:PL)?([0-9A-Za-z_\-]{32})(?:,[\w\s,./\-=?:]*)?$/ ];

  return safeID(url, dflt, __PATTERNS, prefix);
}

function safePlaylistItemID(url, dflt = null, prefix = __ITPREFIX) {  // strips ItemID to pure playlistItem-ID...
  const __PATTERNS = [ /^(?:[0-9\s,]*,)?(?:UE)?([0-9A-Za-z_\-]{66})(?:,[\w\s,./\-=?:]*)?$/ ];

  return safeID(url, dflt, __PATTERNS, prefix);
}

function safeID(url, dflt = null, patterns = null, prefix = __ITPREFIX) {  // strips ID to pure ID according to the patterns...
  const __FULLURL = String(url).split("\n")[0].trim();  // only one line (multi-line makes it complicated)
  const __PATTERNS = (patterns || [ /^(?:[0-9\s,]*,)?([0-9A-Za-z_\-]+)(?:,[\w\s,./\-=?:]*)?$/ ]);

  for (let pattern of __PATTERNS) {
    if (pattern.test(__FULLURL)) {
      const __URL = __FULLURL.replace(pattern, '$1');
      //Logger.log(__FULLURL + " -> " + __URL);

      return (prefix + __URL);
    }
  }

  return dflt;
}

function safeChannelIDOld(channelID, dflt = null, prefix = __CHPREFIX) {  // strips url or channelID to pure channel-ID...
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

function safeUnmatchedQuotation(s) {
  if (typeof(s) === 'string') {
    const __FRONT = s.startsWith('"');
    const __END = s.endsWith('"');

    if (__FRONT) {
      if (__END) {
        Logger.log("Guarding matched quotation marks: " + s);

        return '""' + s + '""';  // "___" --> """___"""
      } else {
        Logger.log("Found unmatched quotation marks: " + s);

        return '""' + s + '"';  // "___ --> """___"
      }
    }
  }

  return s;
}

function globalFilter(cell, col, line, row, field) {
  const __ENTRY = cell;
  const __NEWENTRY = safeUnmatchedQuotation(__ENTRY);
  const __INDEX = col;
  const __ARR = line;
  const __ROWINDEX = row;
  const __MATRIX = field;

  //Logger.log({ 'Entry': __ENTRY, 'Row': __ROWINDEX, 'Col': __INDEX });

  return __NEWENTRY;
}

function filterField(field, filter) {
  const __FIELD = field;  // [ [ , , ... ], [ , , ... ], ... ]
  const __FILTER = filter;
  const __FILTERED = (__FILTER ? (__FIELD && __FIELD.map((row, rowIndex) => (row && row.map(
                      (entry, index, arr) => __FILTER(entry, index, arr, rowIndex, __FIELD))))) : __FIELD);

  return __FILTERED;
}

function getPasteSheet() {
  return setActiveSheet(__PASTESHEETNAME);
}

function getActiveSheet() {
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __ACTIVESHEET = __SPREADSHEET.getActiveSheet();

  return __ACTIVESHEET;
}

function setActiveSheet(table) {  Logger.log("Activating table '" + table + "'");
  const __SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const __SHEET = __SPREADSHEET.getSheetByName(table);
  const __ACTIVEPASTESHEET = (__SHEET ? __SHEET.activate() : null);

  return __ACTIVEPASTESHEET;
}

function getPasteSheetOld() {
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
  const __COLUMN = __CELL.getColumn();
  let ret = false;
  Logger.log(__SHEETNAME); Logger.log(__CELL.getA1Notation());

  // TODO: From Editor (not triggered), getSheetName() delivers 'Paste' and getColumn() the 'A1' cell! Always! Why?
  if (__COLUMN === col) {
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

function PT2time(duration, timeFormat = __TIMEFORMAT) {
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
    const __TIME = Utilities.formatDate(__DATE, __DURTZ, __DURFORMAT);
  
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
  const __LOCAL = __DATE.toLocaleString(__LOCALE, { timeZone: __TZ });

  return __LOCAL;  // .replace(',', '');
}

function addRows(start, offset) {
  // Rows are 1-based, so by adding an offset to a base, 1 is lost...
  return (start + offset - 1);
}

function addCols(start, offset) {
  // Columns are 1-based, so by adding an offset to a base, 1 is lost...
  return (start + offset - 1);
}

function sizeTupel(data) {
  const __ITEM = data;
  const __LEN = ((__ITEM && Array.isArray(__ITEM)) ? __ITEM.length : null);
  const __WIDTH = (__LEN ? (__ITEM[0] && __ITEM[0].length) : (Array.isArray(__ITEM) ? 0 : __ITEM));

  return tupel(__LEN, __WIDTH);
}

function posRange(row, col, len = __SINGLEROW, width = __SINGLECOL, table = null, delims = __DEFDELIMS) {
  return (A1range(row, col, len, width, table) + ' ' + range(row, col, len, width, null, delims));
}

function position(row, col, table = null, delims = __DEFDELIMS) {
  return (A1(row, col, table) + ' ' + tupel(row, col, table, delims));
}

function pos(row, col, table = null, delims = __DEFDELIMS) {
  return (A1(row, col, table) + ' ' + tupel(row, col, null, delims));
}

function A1range(row, col, len = __SINGLEROW, width = __SINGLECOL, table = null) {
  const __REL = ':';

  return (A1(row, col, table) + __REL + A1(row + len - 1, col + width - 1));
}

function A1(row, col, table = null) {
  const __TABLE = (table ? table + '!' : '');  // Google Sheets format
  const __A = 65;  // char code 'A'
  let quot = col - 1;  // 1-based to 0-based!
  let rest = 0;
  let ret = '';

  do {
    const __QUOT = quot;

    // Shift quot by a letter digit...
    rest = __QUOT % 26;
    quot = (__QUOT - rest) / 26 - 1;

    ret = String.fromCharCode(__A + rest) + ret; 
  } while (quot >= 0);

  return (__TABLE + ret + row);
}

function RCrange(row, col, len = __SINGLEROW, width = __SINGLECOL, table = null) {
  return range(row, col, len, width, table, __RCDELIMS)
}

function RC(row, col, table = null) {
  return tupel(row, col, table, __RCDELIMS)
}

function range(row, col, len = __SINGLEROW, width = __SINGLECOL, table = null, delims = __DEFDELIMS) {
  const __REL = (delims[3] || ' - ');

  return (tupel(row, col, table, delims) + __REL + tupel(row + len - 1, col + width - 1, null, delims));
}

function tupel(row, col, table = null, delims = __DEFDELIMS) {
  const __TABLE = (table ? table + ' ' : '');
  const __OPEN = delims[0];
  const __JOIN = delims[1];
  const __CLOSE = delims[2];

  return (__TABLE + __OPEN + row + __JOIN + col + __CLOSE);
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
  const __TIME = __CONFIG.default.dummytime;
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
                    '[<t:1401093073:R>] https://youtu.be/wS4gWQ0_pGE', '[<t:1685779205:R>] https://youtu.be/ENcTAyOp5j4',
                    '[Premiere <t:1687619442:R>] https://youtu.be/h-E6gNN52y8 DONE (<t:1687619913:R>)',
                    'https://www.youtube.com/shorts/JL7ciGyRGpQ?t=2s', ' https://www.youtube.com/shorts/JL7ciGyRGpQ/ ',
                    ' https://www.youtube.com/live/JKk7vvr_nss?si=d6gSzTwRioozDsVx ',
                    'https://www.youtube.com/live/NdZCaDv4ES4?t=7980s (https://www.youtube.com/live/NdZCaDv4ES4?t=6090s) ',
                    'https://www.youtube.com/watch?v=KcQPdxgvmxI (Part 6: "Edge of the World" & "Bravehearted") ' ];

  for (let url of __URLs)  {
    const __VID = safeVID(url);

    Logger.log(url + " -> " + __VID);
  }
}

// Test: safeChannelID()...
function testSafeChannelID() {
  const __IDs = [ 'UC_j-UIb9-xfQ0TpQZ1gU73A', ' UC_wufvzX3aCyXdrfolZuCBQ ', 'UC2eXdGwoXGwk9eKTnWxeCSQ ',
                  ' 4RhhXZinswhdHhLmWQL7rA', '9f0JONUBVrWHaJF75jDwBA', 'Fn_q3syp4YrRtuHA-Ehi_A',
                  'l8rWlxwqaOdRFdL38Ezzew', 'r_wpkXp9lDwG0t35vs1Jvg', 'sQ4R6ihKh2_-2Fc_vWzA7Q',
                  'uSOre3pUobWnlFxkSkHqsQ+', 'uSOre3pUobWnlFxkSkHqs' ];

  for (let channelID of __IDs)  {
    const __CHANNELID = safeChannelID(channelID, "Successfully found error in channelID");

    Logger.log(channelID + " -> " + __CHANNELID);
  }
}

// Test: safePlaylistlID()...
function testSafePlaylistID() {
  const __IDs = [ 'PLnnv1S968oGnUaSKvO3VdRojIZBJ7ZwDP ', ' PLSFgYQhUDHRj8eKSoe-25VwbwPoYhsmze',
                  'https://www.youtube.com/watch?v=Zx9KPfvMVjY&list=PLnnv1S968oGnUaSKvO3VdRojIZBJ7ZwDP&index=1&t=2s',
                  'PLnnv1S968oGnUaSKvO3VdRojIZBJ7ZwDP+', 'PLnnv1S968oGnUaSKvO3VdRojIZBJ7ZwD' ];

  for (let playlistID of __IDs)  {
    const __PLAYLISTID = safePlaylistID(playlistID, "Successfully found error in playlistID");

    Logger.log(playlistID + " -> " + __PLAYLISTID);
  }
}

// Test: safePlaylistlItemID()...
function testSafePlaylistItemID() {
  const __IDs = [ 'UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS41Mzk2QTAxMTkzNDk4MDhF',
                  ' xTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS4zMDg5MkQ5MEVDMEM1NTg2 ',
                  'xTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS45ODRDNTg0QjA4NkFBNkQy',
                  ' UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS5EMEEwRUY5M0RDRTU3NDJC ',
                  'UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS40NzZCMERDMjVEN0RFRThB ',
                  'UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS40NzZCMERDMjVEN0RFRThB+',
                  'UExTRmdZUWhVREhSajhlS1NvZS0yNVZ3YndQb1loc216ZS40NzZCMERDMjVEN0RFRTh ' ];

  for (let playlistItemID of __IDs)  {
    const __PLAYLISTITEMID = safePlaylistItemID(playlistItemID, "Successfully found error in playlistItemID");

    Logger.log(playlistItemID + " -> " + __PLAYLISTITEMID);
  }
}

// Test: copyData(), copyDataEx()...
function testCopyData() {
  Logger.log(copyData({ 'fullCol': false, 'items': { 'clear': { 'len': 2, 'width': 3, 'clear': true }}}));

  Logger.log(copyData());

  Logger.log(copyDataEx(null, 3, 5, { 'a': true, 'b': true }));

  Logger.log(copyData({ 'row': 5, 'col': 7,  'fullCol': false, 'items': {
                                                                          '0': { 'col': __LEFTCOL },
                                                                          '2': { 'col': __LEFTCOL },
                                                                          '3': { 'col': __LEFTCOL }
                                                                        }}));
}

// Test: populateData(), populateDataEx()...
function testPopulateData() {
  const __DATA = [ ['This', 'is'], [ 'a', 'test.' ] ];
  const __DATA2 = [ [ 'More' ], [ 'data!' ] ];
  const __DATA3 = [ [ 'This' ], [ 'is' ], [ 'just' ], [ 'ordinary' ], [ 'data' ] ];

  populateData(null, { 'items': { 'clear': { 'len': 12, 'width': 9, 'clear': true }}});  // Clean area...

  populateData(__DATA3);

  populateData(__DATA, null);

  populateDataEx(null, 3, 5, { 'a': __DATA, 'b': __DATA2 });

  populateData({ '0': __DATA, '2': __DATA2, '3': __DATA3 }, { 'row': 5, 'col': 7, 'items': {
                                                                                              '0': { 'col': __LEFTCOL },
                                                                                              '2': { 'col': __LEFTCOL },
                                                                                              '3': { 'col': __LEFTCOL }
                                                                                            }});

  populateDataEx(null, 3, 2, __DATA3, { 'dummy': true });
}

// Test: pos(), position(), posRange(), tupel(), range(), A1(), A1range(), RC(), RCrange()...
function testPosRange() {
  Logger.log(A1(7, 42));

  Logger.log(pos(2, 1, __PASTESHEETNAME));

  Logger.log(position(1, 5, __PASTESHEETNAME));

  Logger.log(pos(3, 2));

  Logger.log(pos(5, 42));

  Logger.log(range(2, 1, 2, 2, __PASTESHEETNAME));

  Logger.log(range(3, 2, 10, 10));

  Logger.log(A1range(4, 2, 3, 3, __PASTESHEETNAME));

  Logger.log(RCrange(5, 3, 4, 4, __PASTESHEETNAME));

  Logger.log(posRange(3, 6, 4, 6, __PASTESHEETNAME));
}

// Test: syncCell(), getCell(), setCell()...
function testSyncCell() {
  const __DATA = syncCell(7, __LEFTCOL, 'Test');

  Logger.log("__DATA = " + __DATA);

  const __CHANNEL = syncCell(7, __LEFTCOL, 'UCqAy-EERjiQYNBVIOj3MY7A', safeChannelID);

  Logger.log("__CHANNEL = " + __CHANNEL);

  const __PLAYLIST = syncCell(6, __LEFTCOL, 'PLnnv1S968oGnUaSKvO3VdRojIZBJ7ZwDP', safePlaylistID);

  Logger.log("__PLAYLIST = " + __PLAYLIST);
}

// Test: normal()...
function testNormal() {
  const __DATA = [ 'a', 'b', 'c' ];
  let join = ',';

  const __NORMAL = normal(__DATA, join && (arr => arr.join(join)));

  Logger.log(__NORMAL);

  join = null;

  const __IDLENORMAL = normal(__DATA, join && (arr => arr.join(join)));

  Logger.log(__IDLENORMAL);
}

// Test: getFilterArr()...
function testGetFilterArr() {
  const __DATA = [ { id: 1, val: 'one' }, { id: 3, val: 'three' }, { id: 6, val: 'six' }];
  const __INDEX = [ 0, 1, 2, 3, 4, 5, 6 ];
  const __INDEX2 = [ 3, 6, 1 ];
  const __INDEX3 = [ 'three', 'six', 'one' ];

  const __ARR = getFilterArr(__DATA, __INDEX, null, true);

  Logger.log(__ARR);

  const __ARR2ERR = getFilterArr(__DATA, __INDEX2, null, true);

  Logger.log(__ARR2ERR);

  const __ARR2 = getFilterArr(__DATA, __INDEX2, null, false);

  Logger.log(__ARR2);

  const __ARR3 = getFilterArr(__DATA, __INDEX3, (entry => entry.val), false);

  Logger.log(__ARR3);
}

// Test: getListFromArr()...
function testGetListFromArr() {
  const __DATA = [ 'a', 'b', 'c' ];

  const __LIST = getListFromArr(__DATA, (entry => (entry + entry)), ' ');

  Logger.log(__LIST);

  const __LIST2 = getListFromArr(__DATA, (entry => (entry + entry)), null);

  Logger.log(__LIST2);

  const __LIST3 = getListFromArr(__DATA, null, " | ");

  Logger.log(__LIST3);

  const __LIST4 = getListFromArr(__DATA, null, null);

  Logger.log(__LIST4);

  const __LIST5 = getListFromArr(__DATA);

  Logger.log(__LIST5);
}

// Test: globalFilter()... handling unmatched ""
function testGlobalFilter() {
  const __DATA = [].concat(['Normal text before',
                            '"We have a critical text here with unmatched quotation marks!',
                            'Normal text after']);
  Logger.log({ 'Data': __DATA });
  const __FILTERED = [ __DATA.map(globalFilter) ];
  Logger.log({ 'Filtered': __FILTERED });
  const __TABLE = __PASTESHEETNAME;
  const __ROW = 3;
  const __COL = 6;
  const __TEMPLATE = {
                        'table': __TABLE,
                        'row': __ROW,
                        'col': __COL,
                        'max': __MAX,
                        'fullCol': true,
                        'items': {
                                    'filtered': {
                                              'col': 1,
                                              'width': 3
                                            }
                                  }
                     };

  populateData({ 'filtered' : __FILTERED }, __TEMPLATE);
}
